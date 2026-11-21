/* ===================== Journal, Alerts, Second opinion, Template report, Cost, Theme, Pull-to-refresh, Export/Import, Help ===================== */
(function(){
const $=id=>document.getElementById(id);const t=()=>T[lang];
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d;}catch(e){return d;}};const SV=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

/* ---------------- Journal ---------------- */
let jf='open';
const journal=()=>LS('fc_journal',[]);
function renderJournal(){const J=journal();const closed=J.filter(x=>x.status==='closed'&&x.pnl!=null);const t_=t();
  const wins=closed.filter(x=>x.pnl>0),losses=closed.filter(x=>x.pnl<=0);const pnl=closed.reduce((a,x)=>a+x.pnl,0);
  const rs=closed.map(x=>x.rMult).filter(x=>x!=null);const avgR=rs.length?rs.reduce((a,b)=>a+b,0)/rs.length:null;
  const gp=wins.reduce((a,x)=>a+x.pnl,0),gl=Math.abs(losses.reduce((a,x)=>a+x.pnl,0));const pf=gl?gp/gl:(gp?Infinity:null);
  const bySym={};closed.forEach(x=>{bySym[x.symbol]=(bySym[x.symbol]||0)+x.pnl;});const syms=Object.entries(bySym).sort((a,b)=>b[1]-a[1]);
  const item=(k,v,c='')=>`<div class="item"><div class="k">${k}</div><div class="v ${c}">${v}</div></div>`;
  $('jStats').innerHTML=item(t_.jTotal,`${J.length} (${t_.jOpenLbl} ${J.length-closed.length})`)+item(t_.jWin,closed.length?fmt(wins.length/closed.length*100,1)+'%':'—',wins.length/closed.length>=0.5?'g':'')+
    item(t_.jAvgR,avgR==null?'—':fmt(avgR,2)+'R',avgR>0?'g':avgR<0?'r':'')+item(t_.jPnl,(pnl>=0?'+':'')+fmt(pnl,2),pnl>=0?'g':'r')+
    item(t_.jPF,pf==null?'—':pf===Infinity?'∞':fmt(pf,2),pf>1?'g':pf!=null?'r':'')+item(t_.jExp,avgR==null?'—':fmt(avgR,2),avgR>0?'g':'r')+
    item(t_.jBest,syms.length?`${syms[0][0]} (${fmt(syms[0][1],1)})`:'—','g')+item(t_.jWorst,syms.length>1?`${syms.slice(-1)[0][0]} (${fmt(syms.slice(-1)[0][1],1)})`:'—','r');
  const hours={};closed.forEach(x=>{const h=new Date(x.ts).getHours();hours[h]=hours[h]||{n:0,p:0};hours[h].n++;hours[h].p+=x.pnl;});
  const hs=Object.entries(hours).sort((a,b)=>b[1].p-a[1].p).slice(0,3);$('jByHour').innerHTML=hs.length?`<b>${t_.jByHour}</b> `+hs.map(([h,v])=>`${h}:00 (${v.n}×, ${v.p>=0?'+':''}${fmt(v.p,1)})`).join(' · '):'';
  const list=J.filter(x=>jf==='all'||x.status===jf);
  $('jList').innerHTML=list.length?list.map(x=>`<div class="jrow" data-id="${x.id}"><div class="h"><b style="direction:ltr">${x.symbol} <span class="badge ${x.dir==='LONG'?'long':'short'}" style="font-size:11px;padding:0 8px">${x.dir}</span> ${x.lev?fmt(x.lev,1)+'x':''}</b><span class="${x.status==='closed'?(x.pnl>0?'g':'r'):''}" style="font-weight:700;direction:ltr">${x.status==='closed'?((x.pnl>=0?'+':'')+fmt(x.pnl,2)+' USDT'+(x.rMult!=null?' ('+fmt(x.rMult,2)+'R)':'')):t_.jOpenLbl}</span></div>
    <div class="m">${fmtDT(x.ts)} · E ${fmt(x.entry,6)} / SL ${fmt(x.sl,6)} / TP ${fmt(x.tp,6)} · size ${fmt(x.size,6)} · risk ${fmt(x.maxLoss,2)} · R:R 1:${fmt(x.rr,1)}${x.why?' · 🎯 '+t_.jWhyLbl+': '+x.why:''}${x.note?' · 📝 '+x.note:''}${x.lesson?' · 🎓 '+t_.jLessonLbl+': '+x.lesson:''}</div>
    <div class="acts">${x.status==='open'?`<button style="background:var(--green);color:#fff" data-a="tp">${t_.jHitTp}</button><button style="background:var(--red);color:#fff" data-a="sl">${t_.jHitSl}</button><button style="background:var(--card);color:var(--txt);border:1px solid var(--border)!important" data-a="man">${t_.jManual}</button>`:''}<button style="background:var(--card);color:var(--muted);border:1px solid var(--border)!important;flex:0 0 60px" data-a="del">${t_.jDel}</button></div></div>`).join(''):`<div class="hint" style="text-align:center">${t_.jEmpty}</div>`;
  $('jList').querySelectorAll('button').forEach(b=>b.onclick=()=>{const id=+b.closest('.jrow').dataset.id;const J=journal();const x=J.find(y=>y.id===id);if(!x)return;const a=b.dataset.a;
    if(a==='del'){if(!confirm(t_.jDel+'?'))return;SV('fc_journal',J.filter(y=>y.id!==id));renderJournal();return;}
    let pnl;if(a==='tp')pnl=x.potential;else if(a==='sl')pnl=-x.maxLoss;else{const v=prompt(t_.jPnlAsk,'0');if(v===null)return;pnl=parseFloat(v.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));if(isNaN(pnl))return;}
    const note=prompt(t_.jNote,x.note||'');const lesson=prompt(t_.jLesson,x.lesson||'');x.status='closed';x.pnl=pnl;x.rMult=x.maxLoss?pnl/x.maxLoss:null;x.closedAt=Date.now();if(note!==null)x.note=note;if(lesson!==null)x.lesson=lesson;SV('fc_journal',J);renderJournal();});
  if(window.circuitBreaker){const cb=circuitBreaker();const el=document.getElementById('jCb');if(el){el.className='alert '+(cb.state==='stop'?'red':cb.state==='cool'?'yellow':'green');el.textContent=cb.text;}}}

/* ===== Risk circuit breaker (drawdown-circuit-breaker idea, local, from journal) ===== */
const cbCfg=()=>({day:+(localStorage.getItem('fc_cb_day')||3),week:+(localStorage.getItem('fc_cb_week')||6),streak:+(localStorage.getItem('fc_cb_streak')||2),cool:+(localStorage.getItem('fc_cb_cool')||60)});
window.askWhy=()=>{const v=prompt(t().jWhy,'');return v===null?'':v;};
window.circuitBreaker=function(){const c=cbCfg();const J=journal().filter(x=>x.status==='closed'&&x.pnl!=null&&x.closedAt).sort((a,b)=>a.closedAt-b.closedAt);const now=Date.now();const d0=new Date();d0.setHours(0,0,0,0);const w0=now-7*864e5;
  const R=x=>x.rMult!=null?x.rMult:(x.maxLoss?x.pnl/x.maxLoss:0);const day=J.filter(x=>x.closedAt>=d0.getTime()),week=J.filter(x=>x.closedAt>=w0);
  const dR=day.reduce((s,x)=>s+R(x),0),wR=week.reduce((s,x)=>s+R(x),0);let streak=0;for(let i=day.length-1;i>=0;i--){if(day[i].pnl<0)streak++;else break;}
  const lastLoss=[...J].reverse().find(x=>x.pnl<0);const mins=lastLoss?Math.round((now-lastLoss.closedAt)/6e4):null;
  const f=(k,o)=>Object.entries(o).reduce((s,[a,b])=>s.replace('{'+a+'}',b),t()[k]);const fx=v=>(v>0?'+':'')+v.toFixed(1);const reasons=[];
  if(-dR>=c.day)reasons.push(f('cbRDay',{d:fx(dR),x:c.day}));if(-wR>=c.week)reasons.push(f('cbRWeek',{w:fx(wR),x:c.week}));if(streak>=c.streak)reasons.push(f('cbRStreak',{s:streak}));
  let state='ok',text=f('cbOk',{d:fx(dR),w:fx(wR),s:streak});if(reasons.length){state='stop';text=f('cbStop',{r:reasons.join(' · ')});}else if(mins!=null&&c.cool>0&&mins<c.cool){state='cool';text=f('cbCool',{m:mins,c:c.cool-mins});}
  return {state,text,dR,wR,streak,mins,reasons};};
(function(){const ids={cbDay:'fc_cb_day',cbWeek:'fc_cb_week',cbStreak:'fc_cb_streak',cbCool:'fc_cb_cool'};const paint=()=>{const el=document.getElementById('cbStatus');if(el){const cb=circuitBreaker();el.textContent=cb.text;el.style.color=cb.state==='stop'?'var(--red)':cb.state==='cool'?'var(--yellow,#f59e0b)':'var(--green)';}};
  Object.entries(ids).forEach(([id,k])=>{const el=document.getElementById(id);if(!el)return;const v=localStorage.getItem(k);if(v!=null)el.value=v;el.onchange=()=>{localStorage.setItem(k,el.value);paint();};});paint();document.getElementById('setBtn').addEventListener('click',paint);})();
window.renderAlerts=renderAlerts;window.renderHelp=renderHelp;window.renderCost=renderCost;window.renderJournal=renderJournal;
document.querySelectorAll('#jFilters button').forEach(b=>b.onclick=()=>{jf=b.dataset.f;document.querySelectorAll('#jFilters button').forEach(x=>x.classList.toggle('on',x===b));renderJournal();});
document.getElementById('jrnBtn').addEventListener('click',renderJournal);
function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}
$('jExport').onclick=()=>{const J=journal();const cols=['ts','symbol','dir','entry','sl','tp','size','notional','margin','lev','maxLoss','potential','rr','status','pnl','rMult','closedAt','note'];
  const csv=[cols.join(','),...J.map(x=>cols.map(c=>{let v=x[c];if(c==='ts'||c==='closedAt')v=v?new Date(v).toISOString():'';return '"'+String(v??'').replace(/"/g,'""')+'"';}).join(','))].join('\n');download('journal.csv','\ufeff'+csv,'text/csv');};
$('jExportJson').onclick=()=>download('journal.json',JSON.stringify(journal(),null,1),'application/json');

/* ---------------- Price alerts ---------------- */
const alerts=()=>LS('fc_alerts',[]);
function addAlert(sym,price,label){const p=parseFloat(price);if(!(p>0))return;const rows=window.getRows?getRows():[];const r=rows.find(x=>x.symbol===sym);const tv=r?r.tv:`${(window.tvExchNow?tvExchNow():'OKX')}:${sym}.P`;
  const A=alerts();A.push({id:Date.now(),sym,tv,price:p,label:label||'',above:r?p>r.price:null,created:Date.now()});SV('fc_alerts',A);renderAlerts();toast(t().alertSet);
  if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();}
window.addAlert=addAlert;
function renderAlerts(){const A=alerts();$('alertList').innerHTML=A.length?A.map(a=>`<div class="jrow"><div class="h"><b style="direction:ltr">${a.sym} ${a.above===true?'≥':a.above===false?'≤':'@'} ${fmt(a.price,6)}</b><span class="hint">${a.label}</span><button data-id="${a.id}" style="background:none;border:0;color:var(--red);font-size:16px;cursor:pointer">✕</button></div></div>`).join(''):`<div class="hint">${t().alertNone}</div>`;
  $('alertList').querySelectorAll('button').forEach(b=>b.onclick=()=>{SV('fc_alerts',alerts().filter(a=>a.id!==+b.dataset.id));renderAlerts();});}
async function checkAlerts(){const A=alerts();if(!A.length||!window.tvScanPub)return;const tick=[...new Set(A.map(a=>a.tv).filter(Boolean))];if(!tick.length)return;
  try{const j=await tvScanPub({symbols:{tickers:tick},columns:['close']});const px=Object.fromEntries(j.data.map(x=>[x.s,x.d[0]]));let changed=false;
    for(const a of A){const p=px[a.tv];if(p==null)continue;if(a.above===null){a.above=a.price>p;changed=true;continue;}
      const hit=a.above?p>=a.price:p<=a.price;if(hit){fire(`${a.sym} ${t().alertHit} ${fmt(a.price,6)} (${a.label})`);a.hit=true;changed=true;}}
    if(changed){SV('fc_alerts',A.filter(a=>!a.hit));renderAlerts();}}catch(e){}}
function fire(msg){toast(msg);try{navigator.vibrate?.([300,150,300]);}catch(e){}
  if('Notification' in window&&Notification.permission==='granted'){try{navigator.serviceWorker?.ready.then(r=>r.showNotification('Futures Calc',{body:msg,vibrate:[300,150,300],tag:'alert'+Date.now()})).catch(()=>new Notification('Futures Calc',{body:msg}));}catch(e){try{new Notification('Futures Calc',{body:msg});}catch(_){}}}}
setInterval(checkAlerts,30000);setTimeout(checkAlerts,4000);renderAlerts();
$('dAlert').onclick=()=>{const cur=getCur();const r=(getRows()||[]).find(x=>x.symbol===cur);const v=prompt(t().alertAsk,r?String(r.price):'');if(v===null)return;addAlert(cur,v.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/,/g,''),'manual');};
$('dStar').onclick=()=>{const cur=getCur();const on=toggleW(cur);$('dStar').textContent=(on?'★ ':'☆ ')+t().dStar;toast(on?t().starred:t().unstarred);};

/* ---------------- Cost tracking ---------------- */
const PRICE={'gpt-4o-mini':[0.15,0.6],'gpt-4o':[2.5,10],'gpt-4.1-mini':[0.4,1.6],'gpt-4.1':[2,8],'gpt-4.1-nano':[0.1,0.4],'gpt-5':[1.25,10],'gpt-5-mini':[0.25,2],'gpt-5-nano':[0.05,0.4],'o4-mini':[1.1,4.4],'o3':[2,8]};
function addCost(model,usage){if(!usage)return null;const key=Object.keys(PRICE).find(k=>model.startsWith(k));if(!key)return null;const c=(usage.prompt_tokens||0)*PRICE[key][0]/1e6+(usage.completion_tokens||0)*PRICE[key][1]/1e6;
  const m=new Date().toISOString().slice(0,7);const C=LS('fc_cost',{});C[m]=(C[m]||0)+c;SV('fc_cost',C);renderCost();return c;}
window.addCost=addCost;
function renderCost(){const m=new Date().toISOString().slice(0,7);const C=LS('fc_cost',{});$('costInfo').textContent=`${t().costMonth} $${(C[m]||0).toFixed(3)} (OpenAI)`;}
renderCost();

/* ---------------- Second opinion (Gemini on same data) ---------------- */
let sec=localStorage.getItem('fc_second')==='1';
function setSec(v){sec=v;localStorage.setItem('fc_second',v?'1':'0');$('secOn').classList.toggle('on',v);$('secOff').classList.toggle('on',!v);}
$('secOn').onclick=()=>setSec(true);$('secOff').onclick=()=>setSec(false);setSec(sec);
async function secondOpinion(data,gptReport,gptScen){if(!sec)return;const key=localStorage.getItem('fc_gemini_key')||'';const box=$('secondOp');if(!key){box.innerHTML='';return;}
  box.innerHTML=`<div class="hint" style="margin-top:12px"><span class="spin" style="border-color:var(--acc);border-top-color:transparent"></span>${t().secondWait}</div>`;
  try{const model=localStorage.getItem('fc_gemini_model')||'gemini-3.6-flash';const sys=getSYS().replaceAll('LANGUAGE',lang==='fa'?'Persian (Farsi)':'English').replaceAll('SYMBOL',data.symbol).replace('TF',data.timeframe);
    const body={contents:[{parts:[{text:sys+'\n\nDATA:\n'+JSON.stringify(data,null,1)}]}],generationConfig:{temperature:0.3}};
    const {j}=await geminiWithRetry(key,model,body,()=>{});let txt=j.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
    let gs=null;const jm=txt.match(/```(?:json)?\s*(\{[\s\S]*?"long"[\s\S]*?\})\s*```/i);if(jm){try{gs=JSON.parse(jm[1]);}catch(e){}txt=txt.replace(jm[0],'').trim();}
    const d1=gptScen?.recommended||'none',d2=gs?.recommended||'none';const agree=d1===d2;
    const ok=o=>o&&o.entry>0&&o.sl>0&&o.tp>0&&o.entry!==o.sl;const rr=o=>'1:'+fmt(Math.abs(o.tp-o.entry)/Math.abs(o.entry-o.sl),1);const gb=(k,o,col)=>ok(o)?`<button class="primary" style="background:${col}" data-gs="${k}">${k==='long'?'▲ LONG':'▼ SHORT'} ${gs.recommended===k?'★':''}<br><small>${fmt(o.entry,6)} / SL ${fmt(o.sl,6)} / TP ${fmt(o.tp,6)} (${rr(o)})</small></button>`:'';
    const gbtns=(gs&&(ok(gs.long)||ok(gs.short)))?`<div class="hint" style="margin-top:8px"><b>${t().gemScen}</b></div><div class="btns" style="margin-top:0">${gb('long',gs.long,'var(--green)')}${gb('short',gs.short,'var(--red)')}</div>`:'';
    box.innerHTML=`<div class="alert ${agree?'green':'yellow'}" style="margin-top:12px">${agree?t().agree:t().disagree} ChatGPT → <b>${d1.toUpperCase()}</b> · Gemini → <b>${d2.toUpperCase()}</b></div>${gbtns}<details class="op"><summary>${t().secondTitle}</summary><div class="report">${md(txt)}</div></details>`;
    box.querySelectorAll('[data-gs]').forEach(b=>b.onclick=()=>{const o=gs[b.dataset.gs];$('entry').value=o.entry;$('sl').value=o.sl;$('tp').value=o.tp;$('cSym').value=(data.symbol||'').replace('_PERP','');render();document.querySelector('[data-tab="calc"]').click();toast(t().sentToCalc);});
  }catch(e){box.innerHTML=`<div class="alert red" style="margin-top:12px">Gemini: ${e.message}</div>`;}}
window.secondOpinion=secondOpinion;

/* ---------------- Template report (no AI) ---------------- */
$('dTemplate').onclick=()=>{const d=window.curData;if(!d)return;const fa=lang==='fa';const P=x=>x==null?'—':fmt(x,6);
  const trendW={bullish:fa?'صعودی':'Bullish',bearish:fa?'نزولی':'Bearish',sideways:fa?'خنثی/رنج':'Sideways'};
  const rsiW=v=>v==null?'—':v<30?(fa?'اشباع فروش':'oversold'):v<40?(fa?'نزدیک اشباع فروش':'near oversold'):v>70?(fa?'اشباع خرید':'overbought'):v>60?(fa?'نزدیک اشباع خرید':'near overbought'):(fa?'خنثی':'neutral');
  const sup=d.support_50??d.support_1M,res=d.resistance_50??d.resistance_1M;const atr=d.atr14||0;const volR=d.volume_avg10d?d.volume_last/d.volume_avg10d:null;
  const oiTxt=d.oi_change_pct==null?(fa?'داده OI در دسترس نیست.':'OI data unavailable.'):(fa?`تغییر OI ${fmt(d.oi_change_pct,2)}% همراه با قیمت ${d.change_24h_pct>=0?'صعودی':'نزولی'} → ${d.oi_change_pct>0?(d.change_24h_pct>=0?'ورود لانگ‌های جدید':'ورود شورت‌های جدید'):(d.change_24h_pct>=0?'پوشش شورت (Short covering)':'بستن لانگ‌ها (Long unwinding)')}`:`OI change ${fmt(d.oi_change_pct,2)}% with ${d.change_24h_pct>=0?'rising':'falling'} price → ${d.oi_change_pct>0?(d.change_24h_pct>=0?'new longs':'new shorts'):(d.change_24h_pct>=0?'short covering':'long unwinding')}`);
  const fr=d.funding_rate_pct;const frTxt=fr==null?(fa?'داده فاندینگ در دسترس نیست.':'Funding unavailable.'):(fa?`فاندینگ ${fmt(fr,4)}% (${fr>0?'لانگ‌ها به شورت‌ها می‌پردازند':'شورت‌ها به لانگ‌ها می‌پردازند'})${Math.abs(fr)>0.05?' — ⚠️ احتمال Crowded positioning':' — نرمال'}`:`Funding ${fmt(fr,4)}% (${fr>0?'longs pay shorts':'shorts pay longs'})${Math.abs(fr)>0.05?' — ⚠️ possibly crowded':' — normal'}`);
  const lE=sup,lS=sup-atr,lT=d.ema20>sup?d.ema20:res;const sE=res,sS=res+atr,sT=d.ema20<res?d.ema20:sup;const rr=(e,s,tp)=>Math.abs(tp-e)/Math.abs(e-s);
  const md_=fa?`### ${t().tplTitle} — **${d.symbol}** (${d.timeframe})
### ۱) روند با EMA و RSI
* قیمت ${P(d.last_price)} ${d.last_price>d.ema20?'بالای':'زیر'} EMA20 (${P(d.ema20)}) و ${d.last_price>d.ema50?'بالای':'زیر'} EMA50 (${P(d.ema50)}) → روند ${d.timeframe}: **${trendW[d.trend_tf]}**
* RSI(14) = **${fmt(d.rsi14,2)}** (${rsiW(d.rsi14)}) · 1D: ${trendW[d.trend_1d]} RSI ${fmt(d.rsi_1d,0)} · 4H: ${trendW[d.trend_4h]} RSI ${fmt(d.rsi_4h,0)}
### ۲) Mark / Index / Premium
* Mark ${P(d.mark_price)} · Index ${P(d.index_price)} · Last ${P(d.last_price)} · Premium ${d.premium==null?'—':fmt(d.premium,4)} ${d.premium!=null&&Math.abs(d.premium/d.last_price)>0.002?'⚠️ انحراف قابل توجه':'(ناچیز)'}
### ۳) حمایت، مقاومت، ATR، حجم
* حمایت ${P(sup)} · مقاومت ${P(res)} · ATR14 ${P(atr)}
* حجم آخر ${fmt(d.volume_last,2)} vs میانگین ${fmt(d.volume_avg10d,2)} → ${volR==null?'—':volR<0.5?'بسیار کم (بدون مشارکت)':volR>1.5?'بالا (مشارکت قوی)':'نرمال'}
### ۴) Price + OI
* ${oiTxt}
### ۵) Funding
* ${frTxt}
### ۶) سناریوهای مشروط
> قیمت ${((d.last_price-sup)/(res-sup)*100).toFixed(0)}٪ از فاصله حمایت تا مقاومت را طی کرده است.
* **الف) Long مشروط:** ورود نزدیک حمایت ${P(lE)} با تأیید کندلی · SL ${P(lS)} (حمایت − 1 ATR) · هدف ${P(lT)} · R:R ≈ 1:${fmt(rr(lE,lS,lT),1)}
* **ب) Short مشروط:** ورود نزدیک مقاومت ${P(sE)} با ضعف خریدار · SL ${P(sS)} (مقاومت + 1 ATR) · هدف ${P(sT)} · R:R ≈ 1:${fmt(rr(sE,sS,sT),1)}
* **ج) عدم معامله:** اگر قیمت در میانه رنج است و حجم پایین → صبر.
${d.patterns?.length?'* الگوها: '+d.patterns.join('، '):''}

*گزارش قالبی بدون هوش مصنوعی — توصیه مالی نیست.*`
  :`### ${t().tplTitle} — **${d.symbol}** (${d.timeframe})
### 1) Trend (EMA/RSI)
* Price ${P(d.last_price)} ${d.last_price>d.ema20?'above':'below'} EMA20 (${P(d.ema20)}) and ${d.last_price>d.ema50?'above':'below'} EMA50 (${P(d.ema50)}) → ${d.timeframe} trend: **${trendW[d.trend_tf]}**
* RSI(14) = **${fmt(d.rsi14,2)}** (${rsiW(d.rsi14)}) · 1D: ${trendW[d.trend_1d]} RSI ${fmt(d.rsi_1d,0)} · 4H: ${trendW[d.trend_4h]} RSI ${fmt(d.rsi_4h,0)}
### 2) Mark / Index / Premium
* Mark ${P(d.mark_price)} · Index ${P(d.index_price)} · Last ${P(d.last_price)} · Premium ${d.premium==null?'—':fmt(d.premium,4)}
### 3) S/R, ATR, Volume
* Support ${P(sup)} · Resistance ${P(res)} · ATR14 ${P(atr)}
* Last volume ${fmt(d.volume_last,2)} vs avg ${fmt(d.volume_avg10d,2)} → ${volR==null?'—':volR<0.5?'very low':volR>1.5?'high':'normal'}
### 4) Price + OI
* ${oiTxt}
### 5) Funding
* ${frTxt}
### 6) Conditional scenarios
> Price is ${((d.last_price-sup)/(res-sup)*100).toFixed(0)}% of the way from support to resistance.
* **a) Long:** entry near support ${P(lE)} with confirmation · SL ${P(lS)} (support − 1 ATR) · target ${P(lT)} · R:R ≈ 1:${fmt(rr(lE,lS,lT),1)}
* **b) Short:** entry near resistance ${P(sE)} · SL ${P(sS)} (resistance + 1 ATR) · target ${P(sT)} · R:R ≈ 1:${fmt(rr(sE,sS,sT),1)}
* **c) No trade:** mid-range + low volume → wait.
${d.patterns?.length?'* Patterns: '+d.patterns.join(', '):''}

*Template report, no AI — not financial advice.*`;
  $('aiMeta').innerHTML='';$('secondOp').innerHTML='';$('aiReport').innerHTML=md(md_);
  renderScenBtnsExt({long:{entry:lE,sl:lS,tp:lT},short:{entry:sE,sl:sS,tp:sT},recommended:'none'});window.scrollTo({top:$('aiReport').offsetTop-80,behavior:'smooth'});};

/* ---------------- Theme & font ---------------- */
function setTheme(th){document.documentElement.dataset.theme=th;localStorage.setItem('fc_theme',th);$('thDark').classList.toggle('on',th==='dark');$('thLight').classList.toggle('on',th==='light');document.querySelector('meta[name=theme-color]').content=th==='light'?'#f3f5f9':'#0f1420';}
$('thDark').onclick=()=>setTheme('dark');$('thLight').onclick=()=>setTheme('light');setTheme(localStorage.getItem('fc_theme')||'dark');
function setFs(v){document.documentElement.style.setProperty('--fs',v+'px');$('fsShow').textContent=v;$('fontSize').value=v;localStorage.setItem('fc_fs',v);}
$('fontSize').oninput=()=>setFs($('fontSize').value);setFs(localStorage.getItem('fc_fs')||15);

/* ---------------- Export / import settings ---------------- */
const KEYS=['fc_bot_url','fc_ledger','fc_simple','fc_stfee','fc_stslip','fc_onboard','fc_schema','fc_cb_day','fc_cb_week','fc_cb_streak','fc_cb_cool','fc_lang','fc_mode','fc_riskmode','fc_inputs','fc_gemini_key','fc_gemini_model','fc_gemini_custom','fc_openai_key','fc_openai_model','fc_ex','fc_sort','fc_watch','fc_alerts','fc_journal','fc_theme','fc_fs','fc_second','fc_tv','fc_cost','fc_ind','fc_tvbg','fc_chartsrc','fc_skill','fc_acct','fc_riskpct','fc_minrr','fc_nohtf','fc_kronos_url','fc_kronos_len','fc_kronos_n','fc_kronos_t','fc_gemini_base','fc_openai_base'];
$('expSet').onclick=()=>{const o={};KEYS.forEach(k=>{const v=localStorage.getItem(k);if(v!==null)o[k]=v;});download('futures-calc-settings.json',JSON.stringify(o,null,1),'application/json');};
$('impSet').onclick=()=>$('impFile').click();
$('impFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);Object.entries(o).forEach(([k,v])=>{if(KEYS.includes(k))localStorage.setItem(k,v);});toast(t().imported);setTimeout(()=>location.reload(),800);}catch(err){toast('Invalid file');}};r.readAsText(f);};
$('wipeKeys').onclick=()=>{if(!confirm(t().wipeKeys+'?'))return;['fc_gemini_key','fc_openai_key'].forEach(k=>localStorage.removeItem(k));$('apiKey').value='';$('openaiKey').value='';toast(t().wiped);};

/* ---------------- Pull to refresh (screener) ---------------- */
let sy=0,pulling=false;const ptr=$('ptr');
document.addEventListener('touchstart',e=>{if(!$('page-screener').classList.contains('on')||window.scrollY>0)return;sy=e.touches[0].clientY;pulling=true;},{passive:true});
document.addEventListener('touchmove',e=>{if(!pulling)return;const dy=e.touches[0].clientY-sy;ptr.style.height=dy>20?Math.min(dy/2,40)+'px':'0';},{passive:true});
document.addEventListener('touchend',e=>{if(!pulling)return;pulling=false;const h=parseFloat(ptr.style.height)||0;ptr.style.height='0';if(h>=35&&window.scan){scan();toast(t().refreshed);}},{passive:true});

/* ---------------- Help ---------------- */
function renderHelp(){const fa=lang==='fa';$('helpBody').innerHTML=fa?`
<b>حجم پوزیشن</b> = حداکثر ضرر ÷ |ورود − حد ضرر| (+ کارمزد در صورت فعال بودن)
<b>ارزش پوزیشن</b> = حجم × قیمت ورود · <b>مارجین</b> = ارزش ÷ اهرم · <b>اهرم</b> = ارزش ÷ مارجین
<b>R:R</b> = |TP − ورود| ÷ |ورود − SL| · <b>ROE</b> = درصد حرکت قیمت × اهرم
<b>لیکوئید (ایزوله، تقریبی)</b>: Long = ورود × (1 − 1/اهرم + MMR) · Short = ورود × (1 + 1/اهرم − MMR)
<b>R:R ترکیبی</b> = مجموع (درصد خروج × R هر TP) · <b>Break-even</b>: بعد از TP1، حد ضرر را کجا بگذاریم تا کل معامله بی‌ضرر شود.
<b>امتیاز اسکرینر (۰–۱۰۰)</b>: هم‌جهتی 1D (۳۰) + 4H (۲۵) + 1H (۱۵) + سلامت RSI (۱۵) + جهت تغییر 24h (۵) + رتبه حجم (۱۰) + الگوی کندلی هم‌جهت (±۵). علامت ▲/▼ جهت غالب است.
<b>روند</b>: صعودی = قیمت > EMA20 > EMA50 ؛ نزولی = برعکس ؛ در غیر این صورت رنج.
<b>واگرایی RSI</b>: کف پایین‌تر قیمت با کف بالاتر RSI (مثبت) یا سقف بالاتر قیمت با سقف پایین‌تر RSI (منفی) در ۸ کندل اخیر.
<b>Funding</b> مثبت = لانگ‌ها به شورت‌ها می‌پردازند؛ مقادیر بالای ۰٫۰۵٪ نشانه ازدحام است.
<b>OI</b>: قیمت↑ OI↑ لانگ جدید · قیمت↓ OI↑ شورت جدید · قیمت↑ OI↓ پوشش شورت · قیمت↓ OI↓ بستن لانگ.
<b>منابع داده</b>: قیمت و اندیکاتورها از TradingView (زنده)؛ Funding/OI/Mark از صرافی (OKX → Bitget → Gate → Bybit → Binance).
<b>هزینه</b>: تخمینی بر اساس توکن‌های گزارش‌شده OpenAI و قیمت عمومی مدل‌ها.
<b>هشدارها</b>: فقط وقتی اپ باز است بررسی می‌شوند (محدودیت مرورگر). گزارش‌ها ۱۵ دقیقه کش می‌شوند.`
:`<b>Position size</b> = max loss ÷ |entry − SL| (+ fees if enabled) · <b>Notional</b> = size × entry · <b>Margin</b> = notional ÷ leverage
<b>R:R</b> = |TP − entry| ÷ |entry − SL| · <b>ROE</b> = price move % × leverage
<b>Liquidation (isolated, approx.)</b>: Long = entry × (1 − 1/lev + MMR) · Short = entry × (1 + 1/lev − MMR)
<b>Blended R:R</b> = Σ(exit % × R of each TP) · <b>Break-even</b>: where to move SL after TP1 so the whole trade is risk-free.
<b>Screener score (0–100)</b>: 1D alignment (30) + 4H (25) + 1H (15) + RSI health (15) + 24h change direction (5) + volume rank (10) + aligned candle pattern (±5). ▲/▼ = dominant direction.
<b>Trend</b>: bullish = price > EMA20 > EMA50; bearish = reverse; otherwise sideways.
<b>RSI divergence</b>: lower price low with higher RSI low (bullish) or higher price high with lower RSI high (bearish) within the last 8 candles.
<b>Funding</b> positive = longs pay shorts; > 0.05% suggests crowding. <b>OI</b>: price↑ OI↑ new longs · price↓ OI↑ new shorts · price↑ OI↓ short covering · price↓ OI↓ long unwinding.
<b>Data</b>: prices/indicators from TradingView (live); funding/OI/mark from exchanges (OKX → Bitget → Gate → Bybit → Binance).
<b>Cost</b>: estimated from OpenAI usage tokens and public model prices. <b>Alerts</b> run only while the app is open. Reports are cached 15 min.`;}
renderHelp();const _setLang=window.setLang;
document.getElementById('langBtn').addEventListener('click',()=>setTimeout(()=>{renderHelp();renderAlerts();renderCost();if($('page-journal').classList.contains('on'))renderJournal();},0));
})();

(function(){const on=()=>localStorage.getItem('fc_skill')!=='0';const paint=()=>{document.getElementById('skOn').classList.toggle('on',on());document.getElementById('skOff').classList.toggle('on',!on());};
document.getElementById('skOn').onclick=()=>{localStorage.setItem('fc_skill','1');paint();};document.getElementById('skOff').onclick=()=>{localStorage.setItem('fc_skill','0');paint();};paint();})();

/* ===== Market AI tab ===== */
(function(){const $=id=>document.getElementById(id);const t=()=>T[lang];let model='gem',hist=[],live=null,liveTs=0;
let mode=localStorage.getItem('fc_mkmode')||'free';const setMode=m=>{mode=m;localStorage.setItem('fc_mkmode',m);$('mkFree').classList.toggle('on',m==='free');$('mkStruct').classList.toggle('on',m!=='free');};$('mkFree').onclick=()=>setMode('free');$('mkStruct').onclick=()=>setMode('struct');setMode(mode);
const setM=m=>{model=m;$('mkGem').classList.toggle('on',m==='gem');$('mkGpt').classList.toggle('on',m==='gpt');$('mkWeb').parentElement.style.opacity=m==='gem'?'1':'.5';};
$('mkGem').onclick=()=>setM('gem');$('mkGpt').onclick=()=>setM('gpt');
const fmtN=(n,d=1)=>n==null?'—':Number(n).toLocaleString('en-US',{maximumFractionDigits:d});
async function tvQuote(tickers){try{const r=await fetch('https://scanner.tradingview.com/crypto/scan',{method:'POST',body:JSON.stringify({symbols:{tickers},columns:['name','close','change','change|1W','RSI','RSI|240','EMA50','EMA200','High.3M','Low.3M']})});const j=await r.json();return Object.fromEntries(j.data.map(x=>[x.s,{price:x.d[1],chg24:x.d[2],chg7d:x.d[3],rsiD:x.d[4],rsi4h:x.d[5],ema50D:x.d[6],ema200D:x.d[7],high3M:x.d[8],low3M:x.d[9]}]));}catch(e){return {};}}
async function fetchLive(){if(live&&Date.now()-liveTs<5*60*1000)return live;const out={asOf:new Date().toISOString()};
  const [g,f,q]=await Promise.allSettled([fetch('https://api.coingecko.com/api/v3/global').then(r=>r.json()),fetch('https://api.alternative.me/fng/?limit=8').then(r=>r.json()),tvQuote(['BINANCE:BTCUSDT.P','BINANCE:ETHUSDT.P','OKX:XAUUSDT.P','OKX:XAGUSDT.P','BINANCE:SOLUSDT.P'])]);
  if(g.status==='fulfilled'&&g.value.data){const d=g.value.data;out.dominance={btc:+d.market_cap_percentage.btc.toFixed(2),eth:+d.market_cap_percentage.eth.toFixed(2),usdt:+(d.market_cap_percentage.usdt||0).toFixed(2),usdc:+(d.market_cap_percentage.usdc||0).toFixed(2)};out.totalMcapUSD=Math.round(d.total_market_cap.usd);out.mcapChange24h=+d.market_cap_change_percentage_24h_usd.toFixed(2);out.vol24hUSD=Math.round(d.total_volume.usd);}
  if(f.status==='fulfilled'&&f.value.data){out.fearGreed={now:+f.value.data[0].value,label:f.value.data[0].value_classification,last7:f.value.data.map(x=>+x.value)};}
  if(q.status==='fulfilled'){const v=q.value;out.quotes={BTC:v['BINANCE:BTCUSDT.P'],ETH:v['BINANCE:ETHUSDT.P'],SOL:v['BINANCE:SOLUSDT.P'],GOLD_XAU:v['OKX:XAUUSDT.P'],SILVER_XAG:v['OKX:XAGUSDT.P']};}
  live=out;liveTs=Date.now();return out;}
window.mkFetchLive=fetchLive;
function paintLive(d){const it=(l,v)=>`<div class="item"><div class="k">${l}</div><div class="v">${v}</div></div>`;const q=d.quotes||{};const c=x=>x?`${fmtN(x.price,x.price>100?0:2)} <small style="color:${x.chg24>=0?'var(--green)':'var(--red)'}">${x.chg24>=0?'+':''}${fmtN(x.chg24,1)}%</small>`:'—';
  $('mkLive').innerHTML=it('BTC.D',d.dominance?d.dominance.btc+'%':'—')+it('USDT.D',d.dominance?d.dominance.usdt+'%':'—')+it('MCap',d.totalMcapUSD?'$'+fmtN(d.totalMcapUSD/1e12,2)+'T <small style="color:'+(d.mcapChange24h>=0?'var(--green)':'var(--red)')+'">'+(d.mcapChange24h>=0?'+':'')+d.mcapChange24h+'%</small>':'—')+it('F&G',d.fearGreed?d.fearGreed.now+' <small>'+d.fearGreed.label.replace('Extreme ','X-')+'</small>':'—')+it('BTC',c(q.BTC))+it('ETH',c(q.ETH))+it('Gold',c(q.GOLD_XAU))+it('Silver',c(q.SILVER_XAG));}
function add(role,txt){const d=document.createElement('div');d.className='msg '+(role==='user'?'u':'a');if(role==='user')d.textContent=txt;else d.innerHTML=md(txt);$('mkLog').appendChild(d);$('mkLog').scrollTop=1e9;return d;}
async function ask(q){if(!q)return;const btn=$('mkSend');btn.disabled=true;$('mkIn').value='';add('user',q);const think=add('ai',t().chatThinking);hist.push({role:'user',text:q});
  try{let d=null;try{d=await fetchLive();paintLive(d);}catch(e){}
    const L=lang==='fa'?'Persian (Farsi)':'English';const FREE=`# ROLE: Senior financial-markets mentor in a free-flowing chat (crypto, precious metals, macro)
Talk like an experienced desk analyst mentoring a trader: natural, direct, warm, in ${L}. NO fixed template or section headers unless the user asks for a full analysis. Match the length to the question (a short question gets 3-8 lines). Keep the discipline: every market claim anchored to a number/level/date from LIVE_DATA or web results; say clearly what is uncertain; no filler, no generic disclaimers.
You can: identify and explain trends (HTF→LTF, with the numbers that define them), interpret dominance/F&G/funding, connect macro events to price, TEACH concepts step by step with concrete current examples (e.g. explain USDT.D using today's value), quiz the user if they want to practice, critique the user's reasoning honestly, and continue the conversation (ask one sharp follow-up question when it genuinely helps). Methodologies available: Murphy/Dow, Bulkowski patterns, price action, SMC/liquidity (EmperorBTC), Elliott (Miner), Fibonacci, harmonics (Carney), Ichimoku (Patel) — use them when relevant and name them.
Dominance rules of thumb: BTC.D up + BTC up = BTC season; BTC.D down + BTC flat/up = alt rotation; BTC.D up + BTC down = flight to safety; USDT.D rising = risk-off / dry powder, falling = capital deploying.
Today is ${new Date().toISOString().slice(0,10)}. If web search results are available, cite source+date inline for anything from the last 72h.`;
    const sys=(mode==='free'?FREE:(window.SKILL||'').replace('LANG',L)+`\n\n## Context: MARKET DESK CHAT (not a single chart)
You are advising on the whole market: crypto (BTC, ETH, alts), precious metals (gold/silver/platinum), BTC dominance, USDT/USDC dominance (stablecoin dominance rising = risk-off / dry powder; falling = capital deploying), total market cap, macro (Fed path, real yields, DXY, CPI/NFP/FOMC calendar, dollar liquidity, ETF flows), geopolitics and regulation. Interpret dominance with explicit rules: BTC.D rising + BTC up = BTC season; BTC.D falling + BTC flat/up = alt rotation; BTC.D rising + BTC down = flight to safety; USDT.D at resistance = potential market bottom zone, at support = potential top zone. Always separate: (1) what the data says now, (2) what the next 1-7 days scenarios are with triggers, (3) what to watch (dates/levels). Use web search results, when available, for events of the last 72h and cite the source name + date inline. If something cannot be verified, say so. Today is ${new Date().toISOString().slice(0,10)}. Answer in ${L}.
`)+`\nLIVE_DATA (ground truth for numbers; prices of XAU/XAG are USDT perpetuals ≈ spot ounce): ${JSON.stringify(d||{unavailable:true})}${window.trendingSummary?`\nTRENDING (CoinGecko attention): ${JSON.stringify(window.trendingSummary)}`:''}${window.marketFlow&&marketFlow.summary()?`\nDERIVATIVES_FLOW (open the flow panel data; cite as 'Bitget/OKX derivatives'): ${JSON.stringify(marketFlow.summary())}`:''}`;
    let answer='';
    if(model==='gem'){const key=localStorage.getItem('fc_gemini_key')||'';if(!key)throw new Error(t().chatNoKey);const gm=localStorage.getItem('fc_gemini_model')||'gemini-3.6-flash';
      const contents=hist.map(m=>({role:m.role==='user'?'user':'model',parts:[{text:m.text}]}));const base={system_instruction:{parts:[{text:sys}]},contents,generationConfig:{temperature:mode==='free'?0.7:0.4}};let j=null;
      if($('mkWeb').checked){try{j=await geminiCall(gm,key,{...base,tools:[{google_search:{}}]});}catch(e){j=null;}}
      if(!j){try{({j}=await geminiWithRetry(key,gm,base,()=>{}));}catch(e){if(e&&e.status===429)throw new Error(t().quota429);throw e;}}
      answer=j.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';const gs=j.candidates?.[0]?.groundingMetadata?.groundingChunks;if(gs&&gs.length){answer+='\n\n'+(lang==='fa'?'منابع: ':'Sources: ')+[...new Set(gs.map(c=>c.web?.title).filter(Boolean))].slice(0,6).join(' · ');}}
    else{const key=localStorage.getItem('fc_openai_key')||'';if(!key)throw new Error(t().chatNoKey);const om=localStorage.getItem('fc_openai_model')||'gpt-4o-mini';
      const msgs=[{role:'system',content:sys},...hist.map(m=>({role:m.role==='user'?'user':'assistant',content:m.text}))];
      const r=await fetch(oaiBase()+'/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model:om,temperature:0.4,messages:msgs})});const j=await r.json();if(!r.ok)throw new Error(j.error?.message||('HTTP '+r.status));answer=j.choices?.[0]?.message?.content||'';}
    hist.push({role:'ai',text:answer});think.innerHTML=md(answer);}
  catch(e){hist.pop();think.innerHTML=`<span style="color:var(--red)">${(e.message||e)}</span>`;}
  finally{btn.disabled=false;$('mkLog').scrollTop=1e9;}}
$('mkSend').onclick=()=>ask($('mkIn').value.trim());$('mkIn').addEventListener('keydown',e=>{if(e.key==='Enter')ask($('mkIn').value.trim());});
const goQ=()=>{const v=$('mkQuick').value;if(!v)return;ask(t()[v+'t']);$('mkQuick').value='';};$('mkQuickGo').onclick=goQ;$('mkQuick').onchange=goQ;
$('mkClear').onclick=()=>{hist=[];$('mkLog').innerHTML='';};
document.querySelector('[data-tab="market"]').addEventListener('click',()=>{[...$('mkQuick').options].forEach(o=>{if(o.value)o.textContent=t()[o.value];});fetchLive().then(paintLive).catch(()=>{$('mkLive').innerHTML=`<div class="hint">${t().mkLiveFail}</div>`;});});
setM('gem');})();

/* ---- schema versioning + first-run onboarding ---- */
(function(){const SCHEMA=1;try{const v=+(localStorage.getItem('fc_schema')||0);if(v<1){/* v0→1: nothing to migrate yet; placeholder for future key renames */}localStorage.setItem('fc_schema',String(SCHEMA));}catch(e){}
  function onboard(){try{if(localStorage.getItem('fc_onboard')==='1')return;const hasKey=localStorage.getItem('fc_gemini_key')||localStorage.getItem('fc_openai_key');if(hasKey){localStorage.setItem('fc_onboard','1');return;}
    const t=()=>T[lang];const d=document.createElement('div');d.id='obWrap';d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
    d.innerHTML=`<div class="card" style="max-width:420px;width:100%;padding:16px"><h2 style="margin:0 0 8px">${t().obTitle}</h2><ol style="margin:0 0 10px 18px;line-height:1.9;font-size:14px"><li>${t().obS1}</li><li>${t().obS2}</li><li>${t().obS3}</li></ol><div class="hint">${t().obNote}</div><div class="btns" style="margin-top:10px"><button class="primary" id="obKey">${t().obGo}</button><button class="ghost" id="obSkip">${t().obSkip}</button></div></div>`;
    document.body.appendChild(d);const close=()=>{localStorage.setItem('fc_onboard','1');d.remove();};d.querySelector('#obSkip').onclick=close;d.querySelector('#obKey').onclick=()=>{close();const g=document.getElementById('gearBtn')||document.querySelector('[data-tab="settings"]');if(g)g.click();};}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(onboard,600));else setTimeout(onboard,600);})();
