/* ==== v136 #250–#253 "one contract": the app judges every setup with the SAME policy the bot uses (bot.json → coverage), builds ONE exchange-ready
   ticket sized from ONE account, and offers one-tap account sync with the bot. No new strategy, no new engine: the predicate mirrors bot.js shadowWhy(). ==== */
(function(){
const LS=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
const fa=()=>typeof lang==='undefined'||lang==='fa';
const botData=()=>{try{return JSON.parse(LS('fc_bot_cache')||'null');}catch(e){return null;}};
const cls=sym=>/USDT$|USD$/.test(sym)&&!/^(XAU|XAG|XPT|XPD|EUR|GBP|AUD|NZD|USD|CAD|CHF|JPY)/.test(sym)?'crypto':/^(XAU|XAG|XPT|XPD)/.test(sym)?'metal':/^[A-Z]{6}$/.test(sym)?'forex':'stock';
/* mirror of bot.js shadowWhy(): returns {state:'ACTIVE'|'SHADOW'|'OUT'|'UNKNOWN', why} */
function judge(o){const d=botData();const C=d&&d.coverage;if(!C)return {state:'UNKNOWN',why:fa()?'ربات متصل نیست (تب ربات → آدرس bot.json)':'bot not connected'};
  const f=fa();const tfs=[].concat(C.timeframes||[],C.shadowTimeframes||[]);const syms=d.config&&d.config.symbols||null;
  if(syms&&o.sym&&!syms.includes(o.sym))return {state:'OUT',why:f?`خارج از جهان ربات (${syms.length} نماد پرحجم) — ربات این نماد را اسکن نمی‌کند`:`outside the bot universe (${syms.length} symbols)`};
  if(!tfs.includes(o.tf))return {state:'OUT',why:f?`ربات تایم‌فریم ${o.tf} را اسکن نمی‌کند (${tfs.join('/')})`:`bot does not scan ${o.tf}`};
  if(C.classes&&!C.classes.includes(o.cls))return {state:'OUT',why:f?`کلاس ${o.cls} در پوشش ربات نیست`:`class ${o.cls} not covered`};
  if((C.shadowTimeframes||[]).includes(o.tf))return {state:'SHADOW',why:f?`تایم‌فریم ${o.tf} فقط سایه (بک‌تست ۵ ساله: منفی)`:`${o.tf} watch-only (5y backtest negative)`};
  if((C.shadowClasses||[]).includes(o.cls))return {state:'SHADOW',why:f?`کلاس ${o.cls} فقط سایه (شواهد ناکافی)`:`class ${o.cls} watch-only`};
  if(C.paperStrategies&&!C.paperStrategies.includes(o.strategy))return {state:'SHADOW',why:f?`استراتژی ${o.strategy} فقط سایه (بک‌تست: بدون لبه بعد از هزینه)`:`strategy ${o.strategy} watch-only (no edge after costs)`};
  if(C.liveSides&&C.liveSides[o.strategy]&&!C.liveSides[o.strategy].includes(o.side))return {state:'SHADOW',why:f?`جهت ${o.side} برای ${o.strategy} فقط سایه (بک‌تست 4H: LONG منفی)`:`${o.side} watch-only for ${o.strategy}`};
  const mx=C.maxExtAtr;if(mx!=null&&o.ext!=null&&(o.side==='LONG'?o.ext:-o.ext)>mx)return {state:'SHADOW',why:f?`ورود کش‌شده (>${mx}×ATR از EMA20) — فقط سایه`:`extended entry (>${mx}×ATR) — watch-only`};
  return {state:'ACTIVE',why:f?'کاندید فعال — ربات بعد از آزمایشگاه، قوانین و HTF همین را منتشر می‌کند':'live-eligible — bot publishes after lab/rules/HTF'};}
/* same nominations the bot makes from an in-app Lens build: LENS from the packet event, ICHI from the shared strategy lab */
function detect(all,sym,tf){const out=[];const p=all&&all.packet;const k=all&&all.k;if(!p||!k||k.length<60)return out;const c=cls(sym);let ext=null,S0=null;
  try{S0=lens.series(k,null);const L=k.length-2;const A=S0.atr[L],e20=S0.e20[L];if(A&&e20)ext=(k[L].c-e20)/A;}catch(e){}
  const side=p.event==='LONG_SETUP'?'LONG':p.event==='SHORT_SETUP'?'SHORT':null;if(side)out.push({strategy:'LENS',side});
  try{if(S0&&lens.STRATS&&lens.STRATS.ICHI){const X=lens.labSeries(k,S0);const L=k.length-2;const sg=lens.STRATS.ICHI.sig(k,S0,X,L);if(sg){const sd=typeof sg==='string'?sg:sg.side;if(sd)out.push({strategy:'ICHI',side:sd});}}}catch(e){}
  return out.map(n=>Object.assign(n,{sym,tf,cls:c,ext:ext==null?null:+ext.toFixed(2)},{j:judge({sym,tf,cls:c,strategy:n.strategy,side:n.side,ext})}));}
const PILL={ACTIVE:['🎯','var(--green)'],SHADOW:['👁','var(--yellow,#f59e0b)'],OUT:['⛔','var(--muted)'],UNKNOWN:['❔','var(--muted)']};
const lbl=s=>fa()?{ACTIVE:'ربات می‌گیرد',SHADOW:'فقط پایش ربات',OUT:'خارج از ربات',UNKNOWN:'نامشخص'}[s]:{ACTIVE:'bot takes it',SHADOW:'bot watch-only',OUT:'outside bot',UNKNOWN:'unknown'}[s];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function pill(j){const P=PILL[j.state]||PILL.UNKNOWN;return `<span class="pill" title="${esc(j.why)}" style="color:${P[1]};border-color:${P[1]}">${P[0]} ${lbl(j.state)}</span>`;}
/* card under the Lens result (chart tab): what would the bot do with THIS symbol/timeframe right now? */
function cardHtml(all,sym,tf){const f=fa();const noms=detect(all,sym,tf);const d=botData();const C=d&&d.coverage;
  if(!C)return `<div class="item wide" style="margin:6px 0;padding:8px 10px"><b>🤖 ${f?'قرارداد ربات':'bot contract'}</b> <span class="hint" style="margin:0">${f?'ربات متصل نیست — در تب ربات آدرس bot.json را بده تا هر ستاپ با همان قانون ربات برچسب بخورد.':'connect the bot (bot tab) to label every setup with the bot policy.'}</span></div>`;
  const base=judge({sym,tf,cls:cls(sym),strategy:(C.paperStrategies||['ICHI'])[0],side:(C.liveSides&&C.liveSides[(C.paperStrategies||['ICHI'])[0]]||['SHORT'])[0],ext:null});
  const rows=noms.length?noms.map(n=>`<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:3px 0"><b style="color:${n.side==='LONG'?'var(--green)':'var(--red)'}">${n.side==='LONG'?'🟢':'🔴'} ${n.strategy} ${n.side}</b>${pill(n.j)}<span class="hint" style="margin:0">${esc(n.j.why)}${n.ext!=null?` · ext ${n.ext}×ATR`:''}</span></div>`).join(''):`<div class="hint" style="margin:3px 0">${f?'روی کندل بستهٔ آخر هیچ ستاپی (LENS/ICHI) نیست — ربات هم چیزی نامزد نمی‌کرد.':'no LENS/ICHI setup on the last closed bar — the bot would nominate nothing either.'}</div>`;
  return `<div class="item wide" style="margin:6px 0;padding:8px 10px"><div style="display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap;align-items:center"><b>🤖 ${f?'قرارداد ربات برای این چارت':'bot contract for this chart'}</b>${pill(base)}</div>
   <div class="hint" style="margin:2px 0">${f?'جهان ربات':'bot scope'}: ${(C.classes||[]).filter(c=>!(C.shadowClasses||[]).includes(c)).join('/')} · ${(C.timeframes||[]).join('/')} · ${(C.paperStrategies||[]).map(s=>s+(C.liveSides&&C.liveSides[s]?' '+C.liveSides[s].join('+'):'')).join(', ')} · ${f?'همین نماد/تایم‌فریم':'this sym/tf'}: ${esc(base.why)}</div>${rows}
   <div class="hint" style="margin:3px 0;opacity:.75">${f?'برچسب «ربات می‌گیرد» یعنی سیاست اجازه می‌دهد؛ انتشار نهایی بعد از آزمایشگاه/قوانین/HTF ربات در تب ربات → سیگنال‌ها دیده می‌شود. هر چیز دیگری در این اپ تحلیل آزاد است، نه سیگنال رسمی.':'"bot takes it" = policy allows; final publish after bot lab/rules/HTF (bot tab → signals). Everything else here is free analysis, not an official signal.'}</div></div>`;}
/* ONE ticket: exchange-ready text sized from the APP account (the single source of truth for your money) */
const acct=()=>({acct:+LS('fc_acct')||1000,risk:+LS('fc_riskpct')||1});
function ticket(o){const a=acct();const e=+o.entry,sl=+o.stop,t1=+o.t1,t2=+o.t2||null;if(!(e>0&&sl>0&&t1>0&&e!==sl))return null;const side=o.side||(sl<e?'LONG':'SHORT');const riskUSD=a.acct*a.risk/100;const dist=Math.abs(e-sl);const qty=riskUSD/dist;const notional=qty*e;const lev=Math.ceil(notional/a.acct*10)/10;const r1=Math.abs(t1-e)/dist,r2=t2?Math.abs(t2-e)/dist:null;const dp=Math.max(2,Math.min(8,(String(e).split('.')[1]||'').length));const fx=x=>+x.toFixed(dp);
  const j=o.policy||judge({sym:o.sym,tf:o.tf,cls:cls(o.sym||''),strategy:o.strategy||'LENS',side,ext:null});
  const text=[`${o.sym||''} ${side} ${o.tf||''} ${o.strategy||''}`.trim(),`Entry ${fx(e)}${o.entryZone?` (zone ${o.entryZone[0]}–${o.entryZone[1]})`:''} · SL ${fx(sl)}`,`T1 ${fx(t1)} (${r1.toFixed(2)}R, close 50%)${t2?` · T2 ${fx(t2)} (${r2.toFixed(2)}R)`:''}`,`Qty ${+qty.toPrecision(4)} · notional $${notional.toFixed(2)} · lev ≥${lev}x isolated`,`Risk $${riskUSD.toFixed(2)} = ${a.risk}% of $${a.acct} · after T1 move SL to entry`,`Policy: ${j.state} — ${j.why}`].join('\n');
  return {text,side,qty,notional,lev,riskUSD,r1,r2,policy:j,acct:a};}
function ticketHtml(o){const T=ticket(o);const f=fa();if(!T)return `<div class="alert red">${f?'ورود/استاپ/هدف معتبر نیست':'invalid entry/stop/target'}</div>`;const P=PILL[T.policy.state];
  return `<div class="item wide" style="margin:6px 0;padding:8px 10px;border-color:${P[1]}"><div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap"><b>🎫 ${f?'تیکت معامله (OKX)':'trade ticket (OKX)'}</b>${pill(T.policy)}</div>
   <pre style="white-space:pre-wrap;font-size:12px;margin:6px 0;direction:ltr;text-align:left">${esc(T.text)}</pre>
   ${T.policy.state!=='ACTIVE'?`<div class="alert yellow" style="margin:4px 0;font-size:12px">${f?'این تیکت با سیاست ربات «فعال» نیست — اگر معامله می‌کنی، آگاهانه خارج از قرارداد است و در دفتر ربات ثبت نمی‌شود.':'not ACTIVE under the bot policy — trading it is a conscious off-contract decision.'}</div>`:''}
   <div class="btns"><button class="ghost" data-ticket-copy style="padding:4px 10px;font-size:12px">📋 ${f?'کپی':'copy'}</button><button class="ghost" data-ticket-calc="${esc(o.sym)}|${o.entry}|${o.stop}|${o.t1}|${o.t2||''}" style="padding:4px 10px;font-size:12px">🧮 ${f?'ماشین‌حساب':'calculator'}</button></div></div>`;}
function wireTicket(box){if(!box)return;box.querySelectorAll('[data-ticket-copy]').forEach(b=>b.onclick=()=>{const pre=b.closest('.item').querySelector('pre');try{navigator.clipboard.writeText(pre.textContent);}catch(e){}if(window.toast)toast(fa()?'تیکت کپی شد':'ticket copied');});
  box.querySelectorAll('[data-ticket-calc]').forEach(b=>b.onclick=()=>{const [s,e,sl,t1,t2]=b.dataset.ticketCalc.split('|');const $=id=>document.getElementById(id);$('cSym').value=s;$('entry').value=e;$('sl').value=sl;$('tp').value=t1;if(t2){$('tp2').value=t2;$('tp1p').value=50;$('tp2p').value=50;}if(window.render)render();document.querySelector('[data-tab="calc"]').click();});}
/* #253 one account: copy the bot's sizing (config.json account/riskPct, published in bot.json) into the app settings with one tap — the yellow mismatch warning disappears */
function syncAccount(){const d=botData();const c=d&&(d.coverage&&d.coverage.sizing||d.config);if(!c||!c.account)return false;try{localStorage.setItem('fc_acct',String(c.account));localStorage.setItem('fc_riskpct',String(c.riskPct));const $=id=>document.getElementById(id);if($('acctSize'))$('acctSize').value=c.account;if($('lensRiskPct'))$('lensRiskPct').value=c.riskPct;}catch(e){}if(window.toast)toast(fa()?`حساب اپ = ربات: ${c.account}$ × ${c.riskPct}%`:`app account = bot: $${c.account} × ${c.riskPct}%`);return true;}
window.botPolicy={judge,detect,cardHtml,pill,ticket,ticketHtml,wireTicket,syncAccount,cls,acct};
})();
