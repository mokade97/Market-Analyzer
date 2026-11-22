/* ---------------- Market Flow panel: real derivatives data (Bitget tickers + OKX rubik stats), transparent sources ---------------- */
(function(){
const $=id=>document.getElementById(id);const t=()=>T[lang];
const J=async(u,ms=8000)=>{const r=await fetch(u,{signal:(AbortSignal.timeout?AbortSignal.timeout(ms):undefined)});if(!r.ok)throw new Error('HTTP '+r.status);return r.json();};
const STABLE=/^(USDC|USDE|FDUSD|DAI|TUSD|USDP|BUSD|PYUSD|USD1|USDD)USDT$/;
let cache=null,cacheTs=0,busy=false;
const fm=(n,d=1)=>{if(n==null||!isFinite(n))return '—';const a=Math.abs(n);const s=a>=1e9?(n/1e9).toFixed(d)+'B':a>=1e6?(n/1e6).toFixed(d)+'M':a>=1e3?(n/1e3).toFixed(d)+'K':n.toFixed(d);return s;};
const pct=(x,d=2)=>x==null||!isFinite(x)?'—':(x>0?'+':'')+(100*x).toFixed(d)+'%';
async function fetchFlow(force){if(!force&&cache&&Date.now()-cacheTs<5*60*1000)return cache;
  const tk=(await J('https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES')).data||[];
  const rows=tk.filter(x=>/USDT$/.test(x.symbol)&&!STABLE.test(x.symbol)).map(x=>({sym:x.symbol.replace(/USDT$/,''),px:+x.lastPr,chg:+x.change24h,vol:+x.usdtVolume,fund:+x.fundingRate,oi:+x.holdingAmount*+x.lastPr}))
    .filter(x=>x.vol>0).sort((a,b)=>b.vol-a.vol).slice(0,20);
  rows.forEach(r=>r.flow=r.vol*r.chg);           // $ proxy: 24h volume × 24h change (signed)
  const totVol=rows.reduce((s,r)=>s+r.vol,0),totOI=rows.reduce((s,r)=>s+r.oi,0);
  const avgFund=rows.reduce((s,r)=>s+r.fund*r.oi,0)/(totOI||1);
  // OKX rubik stats for top 8 coins: taker buy/sell (24h), OI change (today vs yesterday), long/short account ratio
  const top=rows.slice(0,8);
  await Promise.all(top.map(async r=>{try{const c=r.sym;const [tv,oi,ls]=await Promise.all([
      J(`https://www.okx.com/api/v5/rubik/stat/taker-volume?ccy=${c}&instType=CONTRACTS&period=1D`).catch(()=>null),
      J(`https://www.okx.com/api/v5/rubik/stat/contracts/open-interest-volume?ccy=${c}&period=1D`).catch(()=>null),
      J(`https://www.okx.com/api/v5/rubik/stat/contracts/long-short-account-ratio?ccy=${c}&period=1D`).catch(()=>null)]);
    const t0=tv&&tv.data&&tv.data[0];if(t0){r.sell=+t0[1];r.buy=+t0[2];r.buyRatio=r.buy/((r.buy+r.sell)||1);}
    const o=oi&&oi.data;if(o&&o.length>1){r.oiNow=+o[0][1];r.oiPrev=+o[1][1];r.oiChg=r.oiPrev?(r.oiNow-r.oiPrev)/r.oiPrev:null;}
    const l=ls&&ls.data&&ls.data[0];if(l)r.lsRatio=+l[1];}catch(e){}}));
  cache={asOf:new Date().toISOString(),source:'Bitget USDT-M tickers (24h) + OKX rubik stats (1D)',rows,totVol,totOI,avgFund,
    inflow:rows.filter(r=>r.flow>0).reduce((s,r)=>s+r.flow,0),outflow:rows.filter(r=>r.flow<0).reduce((s,r)=>s+r.flow,0)};
  cacheTs=Date.now();window.flowSummary=summary(cache);return cache;}
function summary(d){return {as_of:d.asOf,source:d.source,note:'flow_usd = 24h volume × 24h price change (directional pressure proxy, NOT exchange netflow)',
  avg_funding_oi_weighted:+(100*d.avgFund).toFixed(4)+'%',top20_volume_usd:Math.round(d.totVol),top20_oi_usd:Math.round(d.totOI),
  coins:d.rows.slice(0,12).map(r=>({sym:r.sym,chg24h:pct(r.chg),funding:pct(r.fund,4),oi_usd:Math.round(r.oi),oi_chg_1d:r.oiChg==null?null:pct(r.oiChg),taker_buy_ratio:r.buyRatio==null?null:+(r.buyRatio).toFixed(2),long_short_accounts:r.lsRatio??null,flow_usd:Math.round(r.flow)}))};}
function render(d){const box=$('flowBody');const maxF=Math.max(...d.rows.map(r=>Math.abs(r.flow)))||1;
  const head=`<div class="stats" style="grid-template-columns:repeat(4,1fr);gap:4px;font-size:11px;margin:6px 0">
    <div class="item"><div class="k">${t().flIn}</div><div class="v g" style="font-size:13px">+$${fm(d.inflow)}</div></div>
    <div class="item"><div class="k">${t().flOut}</div><div class="v r" style="font-size:13px">−$${fm(-d.outflow)}</div></div>
    <div class="item"><div class="k">${t().flOI}</div><div class="v" style="font-size:13px">$${fm(d.totOI)}</div></div>
    <div class="item"><div class="k">${t().flFund}</div><div class="v ${d.avgFund>0?'g':'r'}" style="font-size:13px">${pct(d.avgFund,4)}</div></div></div>`;
  const bars=d.rows.map(r=>{const w=Math.round(50*Math.abs(r.flow)/maxF);const pos=r.flow>=0;
    return `<div style="display:grid;grid-template-columns:52px 1fr 52px;align-items:center;gap:4px;font-size:11px;direction:ltr">
      <b style="text-align:right">${r.sym}</b>
      <div style="position:relative;height:16px;background:var(--card2);border-radius:6px;overflow:hidden"><div style="position:absolute;top:0;bottom:0;${pos?'left:50%':'right:50%'};width:${w}%;background:${pos?'#26a69a':'#ef5350'}"></div><div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--border)"></div>
        <span style="position:absolute;${pos?'left:4px':'right:4px'};top:0;line-height:16px;color:var(--muted)">${pct(r.chg,1)} · F ${pct(r.fund,3)}${r.oiChg!=null?` · OI ${pct(r.oiChg,1)}`:''}${r.buyRatio!=null?` · ${t().flBuy} ${Math.round(100*r.buyRatio)}%`:''}${r.lsRatio!=null?` · L/S ${r.lsRatio}`:''}</span></div>
      <span style="color:${pos?'var(--green)':'var(--red)'};font-weight:700">${pos?'+':'−'}$${fm(Math.abs(r.flow),0)}</span></div>`;}).join('');
  box.innerHTML=head+`<div style="display:flex;flex-direction:column;gap:3px">${bars}</div><div class="hint" style="margin-top:6px">${t().flNote}<br><span style="direction:ltr;display:inline-block">${d.source} · ${new Date(d.asOf).toLocaleTimeString()}</span></div>`;}
async function run(force){if(busy)return;busy=true;const b=$('flowBtn');b.disabled=true;$('flowBody').innerHTML=`<div class="hint"><span class="spin" style="border-color:var(--acc);border-top-color:transparent"></span> ${t().loading}</div>`;
  try{render(await fetchFlow(force));}catch(e){$('flowBody').innerHTML=`<div class="alert red">${t().flErr}: ${escH(e.message||e)}</div>`;}finally{busy=false;b.disabled=false;}}
$('flowBtn').onclick=()=>run(true);
$('flowBox').addEventListener('toggle',()=>{if($('flowBox').open&&!cache)run(false);});
window.marketFlow={fetchFlow,summary:()=>cache?summary(cache):null};
})();

/* ---------------- CoinGecko trending (attention, not a buy signal) ---------------- */
(function(){
const $=id=>document.getElementById(id);const t=()=>T[lang];let cache=null,ts=0;
const fm=n=>{if(n==null||!isFinite(n))return '—';const a=Math.abs(n);return a>=1e9?(n/1e9).toFixed(2)+'B':a>=1e6?(n/1e6).toFixed(1)+'M':a>=1e3?(n/1e3).toFixed(0)+'K':n.toFixed(2);};
const toN=s=>typeof s==='number'?s:parseFloat(String(s||'').replace(/[$,]/g,''));
async function load(force){if(!force&&cache&&Date.now()-ts<5*60*1000)return cache;const r=await fetch('https://api.coingecko.com/api/v3/search/trending',{signal:(AbortSignal.timeout?AbortSignal.timeout(9000):undefined)});if(!r.ok)throw new Error('HTTP '+r.status);const d=await r.json();
  cache={asOf:Date.now(),coins:(d.coins||[]).map(x=>x.item).map(c=>({name:c.name,sym:(c.symbol||'').toUpperCase(),rank:c.market_cap_rank,px:c.data?.price,chg:c.data?.price_change_percentage_24h?.usd,mcap:toN(c.data?.market_cap),vol:toN(c.data?.total_volume),thumb:c.thumb})),
    cats:(d.categories||[]).slice(0,6).map(c=>({name:c.name,chg:c.data?.market_cap_change_percentage_24h?.usd,n:c.coins_count}))};ts=Date.now();
  window.trendingSummary={as_of:new Date(ts).toISOString(),source:'CoinGecko /search/trending (most searched in last 24h = attention, not a signal)',coins:cache.coins.slice(0,10).map(c=>({sym:c.sym,rank:c.rank,chg24h:c.chg==null?null:+c.chg.toFixed(1),mcap:Math.round(c.mcap||0)})),categories:cache.cats.map(c=>({name:c.name,chg24h:c.chg==null?null:+c.chg.toFixed(1)}))};return cache;}
function render(d){const box=$('trBody');const rows=d.coins.map((c,i)=>{const known=(window.EX&&window.symFor)?true:false;const chgCol=c.chg>0?'var(--green)':'var(--red)';const risky=!c.rank||c.rank>300||(c.mcap&&c.mcap<5e7);
  return `<div class="item wide" style="display:flex;align-items:center;gap:8px;padding:6px 8px"><span style="color:var(--muted);width:18px">${i+1}</span><img src="${c.thumb}" alt="" style="width:20px;height:20px;border-radius:50%"><div style="flex:1;min-width:0"><b>${escH(c.sym)}</b> <span class="hint" style="margin:0">${escH(c.name)} · #${c.rank??'—'}</span><div class="hint" style="margin:0;direction:ltr;text-align:left">$${c.px!=null?(c.px<1?c.px.toPrecision(3):fm(c.px)):'—'} · MC $${fm(c.mcap)} · Vol $${fm(c.vol)}</div></div><b style="color:${chgCol}">${c.chg==null?'—':(c.chg>0?'+':'')+c.chg.toFixed(1)+'%'}</b>${risky?`<span class="pill" title="${t().trRisky}">⚠️</span>`:''}<button class="ghost" data-tr="${escH(c.sym)}" style="padding:4px 8px;font-size:11px">${t().awOpen}</button></div>`;}).join('');
  const cats=d.cats.map(c=>`<span class="pill">${escH(c.name)} <b style="color:${c.chg>0?'var(--green)':'var(--red)'}">${c.chg==null?'':(c.chg>0?'+':'')+c.chg.toFixed(1)+'%'}</b></span>`).join(' ');
  box.innerHTML=`<div class="hint" style="margin:4px 0">${t().trCats}: ${cats}</div><div style="display:flex;flex-direction:column;gap:4px">${rows}</div><div class="hint" style="margin-top:6px">${t().trNote} · ${new Date(d.asOf).toLocaleTimeString()}</div>`;
  box.querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>{$('tvSym').value=b.dataset.tr;$('tvLoad').click();document.querySelector('[data-tab="tv"]').click();});}
async function run(force){const b=$('trBtn');b.disabled=true;$('trBody').innerHTML=`<div class="hint"><span class="spin" style="border-color:var(--acc);border-top-color:transparent"></span> ${t().loading}</div>`;try{render(await load(force));}catch(e){$('trBody').innerHTML=`<div class="alert red">${t().flErr}: ${escH(e.message||e)}</div>`;}finally{b.disabled=false;}}
$('trBtn').onclick=()=>run(true);$('trBox').addEventListener('toggle',()=>{if($('trBox').open&&!cache)run(false);});
window.trending={load};
})();
