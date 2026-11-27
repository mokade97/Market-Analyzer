/* ==== v137 chart actions: the AI (Gemini/GPT in "chat about this chart") may append ONE fenced block ```chart-actions [...]``` to its answer.
   The app parses it, shows a preview card and applies ONLY after the user taps "apply". Nothing is drawn/changed silently.
   Supported actions (prices in chart units, times ISO or ms):
     {"draw":"horizontal","price":96400,"label":"PDH"}                     → horizontalStraightLine
     {"draw":"trend","from":{"time":...,"price":...},"to":{...}}          → segment  ("ray" → rayLine)
     {"draw":"zone","top":..,"bottom":..,"from":time?,"to":time?,"label"} → rect (defaults: last 60 bars → last bar)
     {"draw":"fib","from":{...},"to":{...}}                                → fibonacciLine
     {"draw":"text","time":..,"price":..,"text":"..."}                     → text
     {"indicator":"RSI","on":true}        ids from LWChart.IND (EMA, EMA9, SMA, BOLL, VWAP, ST, DON, ICHI, VOL, RSI, MACD, ATR, ADX, KC, …)
     {"alert":{"price":95800,"label":"..."}}                               → app price alert (features.js addAlert)
     {"chart":{"sym":"ETHUSDT","tf":"1D"}}                                 → switch symbol / timeframe
     {"jsIndicator":{"name":"...","pane":"main|sub","code":"..."}}         → user JS indicator (sandboxed iframe, indeditor.js), registered as U<n> and switched on
   AI drawings carry styles.ai=true + the 'AI' tag so "remove AI drawings" can clear them in one tap. ==== */
(function(){
const fa=()=>(typeof lang!=='undefined'?lang:(localStorage.getItem('fc_lang')||'fa'))==='fa';
const AI_COLOR='#a78bfa';
const H=()=>window.__tvLw||null;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ms=t=>{if(t==null)return null;if(typeof t==='number')return t<1e12?t*1000:t;const v=Date.parse(t);return isFinite(v)?v:null;};
const num=x=>{const v=+x;return isFinite(v)&&v>0?v:null;};
const INDS=()=>Object.keys((window.LWChart&&window.LWChart.IND)||{});
/* system-prompt addendum: what the model may emit */
function promptAddendum(){const inds=INDS().filter(x=>!/^U\d+$/.test(x)).join(', ');return `

## CHART ACTIONS (optional, end of answer)
You control the trader's own chart (not TradingView). After your prose you MAY append exactly one fenced block whose language tag is chart-actions, containing a JSON array. Only include actions that add real value (key levels, zones, the indicators your analysis relies on, an alert at the trigger). Max 12 actions. Prices must be plausible for the visible chart. The user previews and approves before anything is applied — never claim you already drew something.
Schema: {"draw":"horizontal","price":N,"label":"S"} | {"draw":"trend"|"ray","from":{"time":ISO,"price":N},"to":{"time":ISO,"price":N},"label":"S"} | {"draw":"zone","top":N,"bottom":N,"from":ISO?,"to":ISO?,"label":"S"} | {"draw":"fib","from":{"time":ISO,"price":N},"to":{"time":ISO,"price":N}} | {"draw":"text","time":ISO,"price":N,"text":"S"} | {"indicator":"ID","on":true|false} with ID in [${inds}] | {"alert":{"price":N,"label":"S"}} | {"chart":{"sym":"BTCUSDT","tf":"15m|1H|4H|1D|1W"}} | {"jsIndicator":{"name":"S","pane":"main"|"sub","code":"JS"}}
jsIndicator code contract: input k = bars [{t,o,h,l,c,v}] oldest→newest; helpers ema(arr,n) sma(arr,n) rsi(arr,n) atr(k,n) hh(k,n) ll(k,n); must return {series:{name:[numbers|null]}, pane, colors:{name:'#hex'}, markers:[{t,side:'up'|'dn',text}]}. No DOM, no network, no imports; pure arithmetic only. Write it only when the user asks for a custom indicator or when no built-in ID covers what you need.`;}
/* parse: returns {text (answer without the block), actions[]} */
function parse(answer){const m=/```chart-actions\s*([\s\S]*?)```/i.exec(answer||'');if(!m)return {text:answer,actions:[]};let arr=[];try{arr=JSON.parse(m[1].trim());}catch(e){try{arr=JSON.parse(m[1].trim().replace(/,\s*]$/,']'));}catch(_){arr=[];}}if(!Array.isArray(arr))arr=[];return {text:answer.replace(m[0],'').trim(),actions:arr.filter(a=>a&&typeof a==='object').slice(0,12)};}
/* describe one action (preview row) */
function describe(a){const f=fa();const p=x=>x==null?'—':(+x).toLocaleString('en-US',{maximumFractionDigits:8});
  if(a.draw==='horizontal')return `― ${f?'خط افقی':'H-line'} ${p(a.price)}${a.label?' · '+esc(a.label):''}`;
  if(a.draw==='trend'||a.draw==='ray')return `${a.draw==='ray'?'↗':'╱'} ${f?(a.draw==='ray'?'پرتو':'خط روند'):a.draw} ${p(a.from&&a.from.price)} → ${p(a.to&&a.to.price)}${a.label?' · '+esc(a.label):''}`;
  if(a.draw==='zone')return `▭ ${f?'ناحیه':'zone'} ${p(a.bottom)}–${p(a.top)}${a.label?' · '+esc(a.label):''}`;
  if(a.draw==='fib')return `𝑓 ${f?'فیبوناچی':'fib'} ${p(a.from&&a.from.price)} → ${p(a.to&&a.to.price)}`;
  if(a.draw==='text')return `T ${esc(a.text||'')} @ ${p(a.price)}`;
  if(a.indicator)return `ƒx ${esc(a.indicator)} ${a.on===false?(f?'خاموش':'off'):(f?'روشن':'on')}`;
  if(a.alert)return `🔔 ${f?'هشدار قیمت':'price alert'} ${p(a.alert.price)}${a.alert.label?' · '+esc(a.alert.label):''}`;
  if(a.chart)return `📈 ${f?'چارت':'chart'} ${esc(a.chart.sym||'')} ${esc(a.chart.tf||'')}`;
  if(a.jsIndicator)return `✎JS ${esc(a.jsIndicator.name||'U')} (${esc(a.jsIndicator.pane||'main')}) · ${(a.jsIndicator.code||'').length} ${f?'کاراکتر':'chars'}`;
  return `? ${esc(JSON.stringify(a)).slice(0,80)}`;}
function valid(a){const h=H();if(a.draw==='horizontal')return !!num(a.price);if(a.draw==='trend'||a.draw==='ray'||a.draw==='fib')return !!(a.from&&a.to&&num(a.from.price)&&num(a.to.price));if(a.draw==='zone')return !!(num(a.top)&&num(a.bottom));if(a.draw==='text')return !!(num(a.price)&&a.text);
  if(a.indicator)return INDS().includes(String(a.indicator).toUpperCase());if(a.alert)return !!num(a.alert.price);if(a.chart)return !!(a.chart.sym||a.chart.tf);if(a.jsIndicator)return !!(a.jsIndicator.code&&/return/.test(a.jsIndicator.code)&&!/document|window|fetch|XMLHttpRequest|import\s|require\(|eval\(|Function\(/.test(a.jsIndicator.code));return false;}
/* --- apply helpers --- */
function tAt(h,back){const b=h.bars;if(!b||!b.length)return Date.now();const i=Math.max(0,b.length-1-(back||0));return b[i].t;}
function nearT(h,t){const b=h.bars;if(!b||!b.length)return t;const v=ms(t);if(v==null)return b[b.length-1].t;let best=b[0].t,d=Infinity;for(const x of b){const dd=Math.abs(x.t-v);if(dd<d){d=dd;best=x.t;}}return best;}
function pushDraw(h,d){d.styles=Object.assign({color:AI_COLOR,size:1,dash:false,ai:true},d.styles||{});h.draw.push(d);}
function applyOne(a,log){const h=H();const f=fa();
  if(a.draw){if(!h)throw new Error(f?'چارت باز نیست':'chart not open');const S={color:AI_COLOR};
    if(a.draw==='horizontal')pushDraw(h,{name:'horizontalStraightLine',points:[{timestamp:tAt(h,0),value:num(a.price)}],styles:S,extendData:a.label||'AI'});
    else if(a.draw==='trend'||a.draw==='ray')pushDraw(h,{name:a.draw==='ray'?'rayLine':'segment',points:[{timestamp:nearT(h,a.from.time||tAt(h,40)),value:num(a.from.price)},{timestamp:nearT(h,a.to.time||tAt(h,0)),value:num(a.to.price)}],styles:S,extendData:a.label||'AI'});
    else if(a.draw==='zone')pushDraw(h,{name:'rect',points:[{timestamp:nearT(h,a.from||tAt(h,60)),value:num(a.top)},{timestamp:nearT(h,a.to||tAt(h,0)),value:num(a.bottom)}],styles:{color:'rgba(167,139,250,.18)',fill:'rgba(167,139,250,.18)'},extendData:a.label||'AI'});
    else if(a.draw==='fib')pushDraw(h,{name:'fibonacciLine',points:[{timestamp:nearT(h,a.from.time||tAt(h,40)),value:num(a.from.price)},{timestamp:nearT(h,a.to.time||tAt(h,0)),value:num(a.to.price)}],styles:S});
    else if(a.draw==='text')pushDraw(h,{name:'text',points:[{timestamp:nearT(h,a.time||tAt(h,0)),value:num(a.price)}],styles:S,extendData:String(a.text)});
    h.saveDrawings&&h.saveDrawings(h,true);h.redraw&&h.redraw();return true;}
  if(a.indicator){if(!h)throw new Error(f?'چارت باز نیست':'chart not open');const id=String(a.indicator).toUpperCase();const on=h.indOn.includes(id);const want=a.on!==false;if(on!==want)h.toggleExtra(id);return true;}
  if(a.alert){const sym=(h&&h.sym)||(document.getElementById('tvSym')&&document.getElementById('tvSym').value.toUpperCase().replace(/USDT$/,'')+'USDT')||'';if(!window.addAlert)throw new Error('alerts n/a');addAlert(sym,num(a.alert.price),(a.alert.label||'AI'));return true;}
  if(a.chart){const $=id=>document.getElementById(id);if(a.chart.sym&&$('tvSym'))$('tvSym').value=String(a.chart.sym).toUpperCase().replace(/USDT$/,'');const tfv={'5m':'5','15m':'15','1H':'60','4H':'240','1D':'D','1W':'W'}[a.chart.tf];if(tfv&&$('tvInt'))$('tvInt').value=tfv;if($('tvLoad'))$('tvLoad').click();return true;}
  if(a.jsIndicator){if(!window.indEditor||!indEditor.add)throw new Error('indEditor n/a');const id=indEditor.add({name:a.jsIndicator.name||'AI',pane:a.jsIndicator.pane==='sub'?'sub':'main',code:a.jsIndicator.code});if(h&&id&&!h.indOn.includes(id))h.toggleExtra(id);return id;}
  throw new Error('unknown action');}
function clearAI(){const h=H();if(!h)return 0;const n=h.draw.length;h.draw=h.draw.filter(d=>!(d.styles&&d.styles.ai)&&!(d.styles&&d.styles.color===AI_COLOR&&d.extendData==='AI'));const rm=n-h.draw.length;h.saveDrawings&&h.saveDrawings(h,true);h.redraw&&h.redraw();return rm;}
/* preview card html (+ wiring) */
function card(actions){const f=fa();if(!actions.length)return '';const rows=actions.map((a,i)=>{const ok=valid(a);return `<label style="display:flex;gap:6px;align-items:flex-start;margin:2px 0;font-size:12px;opacity:${ok?1:.5}"><input type="checkbox" data-ca-i="${i}" ${ok?'checked':'disabled'} style="margin-top:2px"><span>${describe(a)}${ok?'':` <span style="color:var(--red)">(${f?'نامعتبر':'invalid'})</span>`}${a.jsIndicator?`<details style="margin-top:2px"><summary style="cursor:pointer;opacity:.7">${f?'کد':'code'}</summary><pre style="white-space:pre-wrap;font-size:11px;direction:ltr;text-align:left;max-height:160px;overflow:auto">${esc(a.jsIndicator.code)}</pre></details>`:''}</span></label>`;}).join('');
  return `<div class="item wide ca-card" style="margin:6px 0;padding:8px 10px;border-color:${AI_COLOR}"><div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap"><b>🪄 ${f?'اقدام‌های پیشنهادی روی چارت':'proposed chart actions'} (${actions.length})</b><span class="hint" style="margin:0">${f?'هیچ‌چیز بدون تأیید شما اعمال نمی‌شود':'nothing is applied without your approval'}</span></div>${rows}
   <div class="btns" style="margin-top:6px"><button class="primary" data-ca-apply style="padding:5px 12px;font-size:12px">✅ ${f?'اعمال روی چارت':'apply to chart'}</button><button class="ghost" data-ca-clear style="padding:5px 10px;font-size:12px">🧹 ${f?'حذف ترسیم‌های AI':'remove AI drawings'}</button></div><div class="hint ca-out" style="margin:4px 0 0"></div></div>`;}
function wire(el,actions){if(!el)return;const f=fa();const out=el.querySelector('.ca-out');const b=el.querySelector('[data-ca-apply]');if(b)b.onclick=()=>{const picks=Array.from(el.querySelectorAll('[data-ca-i]')).filter(c=>c.checked).map(c=>actions[+c.dataset.caI]);let okN=0;const errs=[];picks.forEach(a=>{try{applyOne(a);okN++;}catch(e){errs.push(describe(a)+': '+(e.message||e));}});if(out)out.innerHTML=`${okN} ${f?'اعمال شد':'applied'}${errs.length?` · <span style="color:var(--red)">${errs.map(esc).join(' · ')}</span>`:''}`;if(okN&&window.toast)toast(f?`${okN} اقدام روی چارت اعمال شد`:`${okN} chart actions applied`);b.disabled=true;};
  const c=el.querySelector('[data-ca-clear]');if(c)c.onclick=()=>{const n=clearAI();if(out)out.textContent=f?`${n} ترسیم AI حذف شد`:`${n} AI drawings removed`;};}
window.chartActions={promptAddendum,parse,describe,valid,applyOne,clearAI,card,wire,AI_COLOR};
})();
