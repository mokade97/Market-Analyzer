/* ---------------- Auto Watch: periodic Lens scan of watchlist + notifications (no auto-trading) ---------------- */
(function(){
const $=id=>document.getElementById(id);
const t=()=>T[lang];
const LS=k=>localStorage.getItem(k);
const cfg=()=>({on:LS('fc_aw_on')==='1',tf:LS('fc_aw_tf')||'4H',min:+(LS('fc_aw_min')||75),every:+(LS('fc_aw_every')||15),syms:(LS('fc_aw_syms')||'').trim()});
const seen=(()=>{try{const o=JSON.parse(LS('fc_aw_seen')||'{}');return o&&typeof o==='object'?o:{};}catch(e){return {};}})();   // key sym|tf|side|barTime -> 1 (avoid duplicate alerts for the same bar)
let log=(()=>{try{const a=JSON.parse(LS('fc_aw_log')||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}})();
let timer=null,running=false;
function symbols(){const c=cfg();const manual=c.syms.split(/[\s,]+/).filter(Boolean).map(s=>{s=s.toUpperCase().replace(/[^A-Z0-9]/g,'');return /USDT$/.test(s)?s:s+'USDT';});
  const w=JSON.parse(LS('fc_watch')||'[]');return [...new Set([...manual,...w])].slice(0,20);}
function saveLog(){log=log.slice(0,40);try{localStorage.setItem('fc_aw_log',JSON.stringify(log));localStorage.setItem('fc_aw_seen',JSON.stringify(seen));}catch(e){}}
function notify(title,body){if(!('Notification' in window))return;if(Notification.permission==='granted'){try{navigator.serviceWorker?.ready.then(r=>r.showNotification(title,{body,icon:'./icon-192.png',tag:'aw-'+title})).catch(()=>{try{new Notification(title,{body});}catch(e){}});}catch(e){}}}
async function scanOnce(manual){if(running)return;running=true;const c=cfg();const syms=symbols();const st=$('awStatus');const started=Date.now();let hits=0,ok=0;
  if(!syms.length){st.textContent=t().awNoSyms;running=false;return;}
  for(let i=0;i<syms.length;i++){const s=syms[i];st.textContent=`${t().awScanning} ${s} (${i+1}/${syms.length})`;
    try{const p=await lens.build(s,c.tf);if(!p)continue;ok++;const L=p.scores.long,S=p.scores.short;const side=L>=c.min&&L>S?'LONG':S>=c.min&&S>L?'SHORT':null;
      if(side){try{if(window.ledger&&p.event.endsWith('SETUP'))ledger.fromPacket(p,'watch');}catch(e){}const bar=p.time||Math.floor(Date.now()/3600000);const key=`${s}|${c.tf}|${side}|${bar}`;if(!seen[key]){seen[key]=1;hits++;
        const e={ts:Date.now(),sym:s,tf:c.tf,side,score:side==='LONG'?L:S,regime:p.regime,htf:p.trend?.htf_bias,pat:p.candle?.pattern,px:p.candle?.c};log.unshift(e);
        notify(`${side==='LONG'?'🟢':'🔴'} ${s} ${c.tf} · Lens ${e.score}`,`${side} · ${e.regime||''} · HTF ${e.htf||''} · ${e.pat||''}`);
        if(window.toast)toast(`${side==='LONG'?'🟢':'🔴'} ${s} ${side} ${e.score}`);}}
    }catch(e){}
    await new Promise(r=>setTimeout(r,400));}
  saveLog();renderLog();const sec=Math.round((Date.now()-started)/1000);
  st.textContent=`${t().awDone} ${ok}/${syms.length} · ${hits} ${t().awHits} · ${sec}s · ${new Date().toLocaleTimeString()}`;localStorage.setItem('fc_aw_last',String(Date.now()));running=false;}
function renderLog(){const box=$('awLog');if(!log.length){box.innerHTML=`<div class="hint">${t().awEmpty}</div>`;return;}
  box.innerHTML=log.map(e=>`<div class="item wide" style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 10px">
    <div><b style="color:${e.side==='LONG'?'var(--green)':'var(--red)'}">${e.side==='LONG'?'🟢':'🔴'} ${e.sym}</b> <span class="pill">${e.tf}</span> <span class="pill">Lens ${e.score}</span> ${e.regime?`<span class="pill">${e.regime}</span>`:''} ${e.htf?`<span class="pill">HTF ${e.htf}</span>`:''}
      <div class="hint" style="margin:2px 0 0">${e.pat||''} · ${fmtDT(e.ts)}</div></div>
    <button class="ghost" data-aw="${e.sym}" style="padding:6px 10px;font-size:12px;white-space:nowrap">${t().awOpen}</button></div>`).join('');
  box.querySelectorAll('[data-aw]').forEach(b=>b.onclick=()=>{$('tvSym').value=b.dataset.aw.replace(/USDT$/,'');const tfv={'15m':'15','1H':'60','4H':'240','1D':'D'}[cfg().tf];if(tfv)$('tvInt').value=tfv;$('tvLoad').click();document.querySelector('[data-tab="tv"]').click();});}
function schedule(){clearInterval(timer);timer=null;const c=cfg();if(!c.on)return;timer=setInterval(()=>{if(navigator.onLine)scanOnce(false);},Math.max(5,c.every)*60000);
  const last=+(LS('fc_aw_last')||0);if(Date.now()-last>c.every*60000)setTimeout(()=>scanOnce(false),3000);}
function init(){const c=cfg();$('awOn').checked=c.on;$('awTf').value=c.tf;$('awMin').value=c.min;$('awEvery').value=c.every;$('awSyms').value=c.syms;
  $('awOn').onchange=()=>{localStorage.setItem('fc_aw_on',$('awOn').checked?'1':'0');if($('awOn').checked&&'Notification' in window&&Notification.permission==='default')Notification.requestPermission();schedule();$('awStatus').textContent=$('awOn').checked?t().awArmed:t().awOff;};
  $('awTf').onchange=()=>localStorage.setItem('fc_aw_tf',$('awTf').value);$('awMin').onchange=()=>localStorage.setItem('fc_aw_min',$('awMin').value);
  $('awEvery').onchange=()=>{localStorage.setItem('fc_aw_every',$('awEvery').value);schedule();};$('awSyms').onchange=()=>localStorage.setItem('fc_aw_syms',$('awSyms').value);
  $('awScan').onclick=()=>scanOnce(true);$('awClear').onclick=()=>{log=[];saveLog();renderLog();};
  $('awStatus').textContent=c.on?t().awArmed:t().awOff;renderLog();schedule();
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&cfg().on){const last=+(LS('fc_aw_last')||0);if(Date.now()-last>cfg().every*60000)scanOnce(false);}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.autoWatch={scanOnce,symbols};
})();
