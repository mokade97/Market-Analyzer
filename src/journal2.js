/* ==== journal2.js (v125): Trade Grader (QUEUE E31) — context tags on every saved trade + stats by side × regime × TF × session × day-condition,
   Morning-plan / Session-recap cards. Hooks renderJournal() and the save path (fc_journal). ==== */
(function(){
const LSJ=()=>{try{return JSON.parse(localStorage.getItem('fc_journal')||'[]');}catch(e){return [];}};
const fa=()=>((typeof lang!=='undefined'&&lang)||localStorage.getItem('fc_lang')||'fa')==='fa';
const SESS=h=>h<7?'Asia':h<13?'London':h<21?'NY':'Late';
function dayCond(){try{const r=(window.rows||[]).find(x=>/^BTC/.test(x.symbol));const ch=r&&r.change24!=null?+r.change24:null;if(ch==null)return null;return ch>2?'risk-on':ch<-2?'risk-off':'flat';}catch(e){return null;}}
function ctxNow(){const d=new Date();const tfv=(document.getElementById('tvInt')||{}).value;const tf=({'15':'15m','60':'1H','240':'4H','D':'1D'})[tfv]||tfv||null;let regime=null;try{const L=window.lensLast;const p=L&&(L.p||L.packet);regime=p&&p.regime||null;}catch(e){}
 return {hour:d.getUTCHours(),dow:d.getUTCDay(),sess:SESS(d.getUTCHours()),tf,regime,day:dayCond(),tags:[]};}
/* tag newly saved trades (the save handler lives in the template; we watch the list) */
let lastTop=null;function tagNew(){const J=LSJ();if(!J.length)return;const top=J[0];if(top.id===lastTop)return;lastTop=top.id;if(!top.ctx){top.ctx=ctxNow();localStorage.setItem('fc_journal',JSON.stringify(J));}}
window.journalTag=function(id,tag){const J=LSJ();const x=J.find(y=>y.id===id);if(!x)return;x.ctx=x.ctx||ctxNow();const i=x.ctx.tags.indexOf(tag);if(i<0)x.ctx.tags.push(tag);else x.ctx.tags.splice(i,1);localStorage.setItem('fc_journal',JSON.stringify(J));if(window.renderJournal)renderJournal();};
const DAYTAGS=['trend-day','range-day','news','chop','gap'];
function grade(closed){const dims={side:x=>x.dir,regime:x=>x.ctx&&x.ctx.regime||'?',tf:x=>x.ctx&&x.ctx.tf||'?',sess:x=>x.ctx&&x.ctx.sess||SESS(new Date(x.ts).getUTCHours()),day:x=>x.ctx&&x.ctx.day||'?',tag:x=>(x.ctx&&x.ctx.tags&&x.ctx.tags.length?x.ctx.tags:['—'])};
 const out={};for(const d in dims){const g={};closed.forEach(x=>{let v=dims[d](x);(Array.isArray(v)?v:[v]).forEach(k=>{g[k]=g[k]||{n:0,w:0,r:0,p:0};g[k].n++;if(x.pnl>0)g[k].w++;g[k].r+=x.rMult==null?0:x.rMult;g[k].p+=x.pnl;});});out[d]=Object.entries(g).sort((a,b)=>b[1].r-a[1].r);}return out;}
function render(){const el=document.getElementById('jByHour');if(!el)return;tagNew();const J=LSJ();const closed=J.filter(x=>x.status==='closed'&&x.pnl!=null);const F=fa();let box=document.getElementById('jGrader');if(!box){box=document.createElement('div');box.id='jGrader';el.parentNode.insertBefore(box,el.nextSibling);}
 const DN={side:['جهت','Side'],regime:['رژیم (lens)','Regime (lens)'],tf:['تایم‌فریم','Timeframe'],sess:['سشن (UTC)','Session (UTC)'],day:['وضعیت روز (BTC 24h)','Day condition (BTC 24h)'],tag:['تگ‌های روز','Day tags']};
 const G=grade(closed);const fmtR=v=>(v>=0?'+':'')+v.toFixed(1)+'R';
 const tbl=Object.keys(G).filter(d=>G[d].length&&!(G[d].length===1&&/^[?—]$/.test(G[d][0][0]))).map(d=>`<div style="margin:6px 0"><div class="hint" style="margin:0 0 2px"><b>${DN[d][F?0:1]}</b></div><div style="display:flex;flex-wrap:wrap;gap:4px">${G[d].map(([k,v])=>`<span style="font-size:11px;border:1px solid ${v.r>0?'#26a69a':v.r<0?'#ef5350':'var(--border,#334155)'};border-radius:8px;padding:2px 7px">${k} · ${v.n}× · ${Math.round(100*v.w/v.n)}% · <b style="color:${v.r>=0?'#26a69a':'#ef5350'}">${fmtR(v.r)}</b></span>`).join('')}</div></div>`).join('');
 /* morning plan: best & worst contexts with n>=3 */
 const flat=[];Object.keys(G).forEach(d=>G[d].forEach(([k,v])=>{if(v.n>=3&&!/^[?—]$/.test(k))flat.push({d,k,...v,avg:v.r/v.n});}));flat.sort((a,b)=>b.avg-a.avg);const best=flat.slice(0,3),worst=flat.slice(-3).reverse().filter(x=>x.avg<0);
 const today=new Date().toDateString();const tod=J.filter(x=>new Date(x.ts).toDateString()===today);const todC=tod.filter(x=>x.status==='closed'&&x.pnl!=null);const todR=todC.reduce((a,x)=>a+(x.rMult||0),0);
 const open=J.filter(x=>x.status==='open');
 const plan=`<div class="card" style="padding:8px;margin-top:8px"><b>🌅 ${F?'برنامهٔ صبح':'Morning plan'}</b><div class="hint" style="margin:4px 0 0">${closed.length<5?(F?'بعد از ≥۵ معاملهٔ بسته، لبهٔ شخصی‌ات اینجا خلاصه می‌شود.':'After ≥5 closed trades your personal edge is summarised here.'):''}
  ${best.length?`<div>✅ ${F?'لبهٔ تو':'Your edge'}: ${best.map(b=>`<b>${DN[b.d][F?0:1]}=${b.k}</b> (${b.n}×, ${fmtR(b.r)})`).join(' · ')}</div>`:''}
  ${worst.length?`<div>⛔ ${F?'پرهیز':'Avoid'}: ${worst.map(b=>`<b>${DN[b.d][F?0:1]}=${b.k}</b> (${b.n}×, ${fmtR(b.r)})`).join(' · ')}</div>`:''}
  <div>${F?'امروز':'Today'}: BTC ${dayCond()||'—'} · ${F?'باز':'open'} ${open.length} · ${F?'سشن':'session'} ${SESS(new Date().getUTCHours())}</div>
  <div style="margin-top:4px">${F?'تگ امروز':'Tag today'}: ${DAYTAGS.map(tg=>`<button class="ghost" style="padding:1px 7px;font-size:11px" onclick="journalTag(${tod[0]?tod[0].id:0},'${tg}')">${tg}</button>`).join(' ')}${tod[0]?'':`<span class="hint" style="margin:0"> (${F?'اول یک معامله ثبت کن':'save a trade first'})</span>`}</div></div></div>`;
 const recap=tod.length?`<div class="card" style="padding:8px;margin-top:8px"><b>🌙 ${F?'جمع‌بندی سشن':'Session recap'}</b><div class="hint" style="margin:4px 0 0">${tod.length} ${F?'معامله':'trades'} · ${todC.length} ${F?'بسته':'closed'} · <b style="color:${todR>=0?'#26a69a':'#ef5350'}">${fmtR(todR)}</b> · ${F?'تگ‌ها':'tags'}: ${[...new Set(tod.flatMap(x=>x.ctx&&x.ctx.tags||[]))].join(', ')||'—'}<br>${tod.map(x=>`${x.symbol} ${x.dir} ${x.status==='closed'?(x.rMult!=null?fmtR(x.rMult):(x.pnl>0?'+':'')+x.pnl):'open'}${x.ctx?` <span style="opacity:.6">[${x.ctx.sess}${x.ctx.tf?' '+x.ctx.tf:''}${x.ctx.regime?' '+x.ctx.regime:''}]</span>`:''}`).join(' · ')}</div></div>`:'';
 box.innerHTML=`<details style="margin-top:8px" ${closed.length?'open':''}><summary class="hint" style="margin:0;cursor:pointer"><b>🎓 ${F?'نمره‌دهی معاملات (Trade Grader)':'Trade Grader'}</b> · ${closed.length} ${F?'بسته':'closed'}</summary>${tbl||`<div class="hint">${F?'هنوز معاملهٔ بسته‌ای نیست.':'No closed trades yet.'}</div>`}${plan}${recap}</details>`;}
if(window.renderJournal){const orig=window.renderJournal;window.renderJournal=function(){const r=orig.apply(this,arguments);try{render();}catch(e){}return r;};}
document.addEventListener('fc:lang',()=>{try{render();}catch(e){}});
setTimeout(()=>{try{render();const jl=document.getElementById('jList');if(jl&&window.MutationObserver){let tm=null;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{try{render();}catch(e){}},50);}).observe(jl,{childList:true});}}catch(e){}},800);
})();
