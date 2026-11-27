/* ==== review.js (v132 #226): "Review this trade with the tutor" — Socratic post-trade review on the user's OWN journal trades.
   The tutor never sees a screenshot: the app fetches the candles around entry/exit, computes numeric facts (stop vs. structure in ATR,
   round-number stop, MAE/MFE, R planned vs. realised, time held, session) and asks the tutor model for exactly THREE Socratic questions
   (entry logic / stop placement / management). The student answers in a textarea; the model then gives short, falsifiable feedback.
   Reviews are stored on the journal entry (x.review) so they survive reloads. ==== */
(function(){
const $=id=>document.getElementById(id);const fa=()=>((typeof lang!=='undefined'&&lang)||localStorage.getItem('fc_lang')||'fa')==='fa';
const LSJ=()=>{try{return JSON.parse(localStorage.getItem('fc_journal')||'[]');}catch(e){return [];}};const SVJ=j=>localStorage.getItem('fc_journal')!=null&&localStorage.setItem('fc_journal',JSON.stringify(j));
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TFMS={'15m':9e5,'1H':36e5,'4H':144e5,'1D':864e5};
const T=()=>fa()?{btn:'🎓 بازبینی با مربی',redo:'🎓 بازبینی دوباره',loading:'⏳ دریافت کندل‌ها و محاسبهٔ واقعیات…',facts:'واقعیات چارت (محاسبهٔ اپ، بدون AI)',q:'سه سؤال مربی — صادقانه جواب بده؛ هدف قضاوت نیست، دیدن الگوی خودت است',ans:'پاسخ‌هایت (برای هر سؤال یک خط)',send:'ارسال پاسخ‌ها',fb:'بازخورد مربی',noKey:'کلید هوش مصنوعی آموزش تنظیم نشده (تنظیمات ← هوش مصنوعی آموزش).',noData:'کندل این نماد/بازه پیدا نشد.',close:'بستن'}
                 :{btn:'🎓 Review with tutor',redo:'🎓 Review again',loading:'⏳ fetching candles & computing facts…',facts:'Chart facts (computed by the app, no AI)',q:'Three tutor questions — answer honestly; the goal is seeing your own pattern, not judgment',ans:'Your answers (one line per question)',send:'Send answers',fb:'Tutor feedback',noKey:'Tutor AI key not set (Settings → Tutor AI).',noData:'No candles found for this symbol/range.',close:'Close'};
const atr=(k,i,n=14)=>{let s=0,c=0;for(let j=Math.max(1,i-n+1);j<=i;j++){const b=k[j],p=k[j-1];s+=Math.max(b.h-b.l,Math.abs(b.h-p.c),Math.abs(b.l-p.c));c++;}return c?s/c:0;};
const qsym=s=>{s=String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(!s)return 'BTCUSDT';if(/USDT$/.test(s))return s;if(/USD$/.test(s))return s+'T';return s+'USDT';};
const isRound=p=>{if(!(p>0))return false;const m=Math.pow(10,Math.floor(Math.log10(p))-1);const r=p/m;return Math.abs(r-Math.round(r/5)*5)<0.02*r;};
/* ---- facts ---- */
async function facts(x){const tf=(x.ctx&&x.ctx.tf&&TFMS[x.ctx.tf])?x.ctx.tf:'4H';const sym=qsym(x.symbol);const K=await window.klinesAny(sym,tf,1000);if(!K||K.length<60)throw new Error(T().noData);
  const t0=+x.ts,t1=+(x.closedAt||Date.now());let i0=K.findIndex(b=>b.t>t0)-1;if(i0<0)i0=K.length-1;let i1=K.findIndex(b=>b.t>t1)-1;if(i1<0)i1=K.length-1;if(i1<i0)i1=i0;
  const LG=x.dir==='LONG';const A=atr(K,i0)||1;const pre=K.slice(Math.max(0,i0-120),i0+1);const piv=window.ind2&&window.ind2.piv?window.ind2.piv(pre,5):[];
  const lows=piv.filter(p=>p.t==='L').map(p=>p.p),highs=piv.filter(p=>p.t==='H').map(p=>p.p);
  const swing=LG?Math.max(...lows.filter(v=>v<x.entry),-Infinity):Math.min(...highs.filter(v=>v>x.entry),Infinity);
  const stopVsSwing=Number.isFinite(swing)?+(((LG?swing-x.sl:x.sl-swing))/A).toFixed(2):null; /* >0: stop is beyond the swing (protected), <0: stop sits inside the structure */
  const held=K.slice(i0+1,i1+1);const mfe=held.length?(LG?Math.max(...held.map(b=>b.h))-x.entry:x.entry-Math.min(...held.map(b=>b.l))):0;const mae=held.length?(LG?x.entry-Math.min(...held.map(b=>b.l)):Math.max(...held.map(b=>b.h))-x.entry):0;
  const risk=Math.abs(x.entry-x.sl)||A;const after=K.slice(i1+1,i1+21);const postMove=after.length?((LG?Math.max(...after.map(b=>b.h)):Math.min(...after.map(b=>b.l)))-x.entry)/risk*(LG?1:-1):null;
  const c=pre.map(b=>b.c);const ema=(p)=>{const a=2/(p+1);let e=c[0];for(let i=1;i<c.length;i++)e=c[i]*a+e*(1-a);return e;};const e20=ema(20),e50=ema(50);
  const hourUtc=new Date(t0).getUTCHours();const sess=hourUtc<7?'Asia':hourUtc<13?'London':hourUtc<21?'NY':'Late';
  const F={sym,tf,side:x.dir,entry:x.entry,stop:x.sl,tp:x.tp,planned_rr:x.rr,realised_r:x.rMult,pnl:x.pnl,atr:+A.toPrecision(4),stop_dist_atr:+(risk/A).toFixed(2),stop_vs_swing_atr:stopVsSwing,stop_round_number:isRound(x.sl),
    entry_vs_ema20_atr:+((x.entry-e20)/A).toFixed(2),ema20_vs_ema50:e20>e50?'bull':'bear',bars_held:held.length,hours_held:+((t1-t0)/36e5).toFixed(1),mfe_r:+(mfe/risk).toFixed(2),mae_r:+(mae/risk).toFixed(2),
    best_r_within_20_bars_after_exit:postMove==null?null:+postMove.toFixed(2),session_utc:sess+' '+hourUtc+'Z',why:x.why||null,note:x.note||null,lesson:x.lesson||null,tags:(x.ctx&&x.ctx.tags)||[]};
  return F;}
function factsHtml(F){const t=T();const row=(k,v,c)=>`<span class="pill"${c?` style="border-color:${c}"`:''}>${k}: <b>${v}</b></span>`;const g='var(--green)',r='var(--red)',y='var(--yellow)';
  return `<div class="hint" style="margin:6px 0 2px"><b>${t.facts}</b></div><div style="display:flex;flex-wrap:wrap;gap:4px;direction:ltr">
   ${row('R',`${F.realised_r==null?'—':F.realised_r.toFixed(2)} / plan ${F.planned_rr||'—'}`,F.realised_r>0?g:r)}${row('stop',`${F.stop_dist_atr}×ATR`,F.stop_dist_atr<0.8?r:F.stop_dist_atr>3?y:g)}
   ${F.stop_vs_swing_atr!=null?row('stop vs swing',`${F.stop_vs_swing_atr>=0?'+':''}${F.stop_vs_swing_atr}×ATR`,F.stop_vs_swing_atr<0?r:F.stop_vs_swing_atr<0.2?y:g):''}${F.stop_round_number?row('stop','round number ⚠️',y):''}
   ${row('entry vs EMA20',`${F.entry_vs_ema20_atr}×ATR`,Math.abs(F.entry_vs_ema20_atr)>2.5?y:'')}${row('EMA20/50',F.ema20_vs_ema50)}${row('MFE / MAE',`${F.mfe_r}R / ${F.mae_r}R`,F.mfe_r>=1&&F.realised_r<=0?y:'')}
   ${row('held',`${F.bars_held} bars · ${F.hours_held}h`)}${F.best_r_within_20_bars_after_exit!=null?row('after exit (20 bars)',`${F.best_r_within_20_bars_after_exit}R`,F.best_r_within_20_bars_after_exit>1.5&&F.realised_r<1?y:''):''}${row('session',F.session_utc)}</div>`;}
/* ---- tutor ---- */
const sysP=()=>(window.LEARN_SKILL||'You are a senior trading coach.').replace(/LANG/g,fa()?'Persian (فارسی)':'English')+`\nYou are reviewing a student's OWN closed trade. Coach Socratically: never lecture first, never say what they should have done before they answer. Numbers come from the app and are ground truth.`;
async function askQuestions(F){const r=await window.tutorAI.chat([{role:'system',content:sysP()},{role:'user',content:`TRADE FACTS (JSON, app-computed):\n${JSON.stringify(F)}\n\nAsk EXACTLY three short Socratic questions, numbered 1-3, in ${fa()?'Persian':'English'}:\n1) about the ENTRY logic (use entry_vs_ema20, ema20_vs_ema50, session, 'why'),\n2) about the STOP placement (use stop_vs_swing_atr, stop_round_number, stop_dist_atr, mae_r),\n3) about MANAGEMENT/EXIT (use mfe_r vs realised_r, hours_held, best_r_within_20_bars_after_exit).\nEach question must quote at least one number from the facts. No answers, no advice, no preamble. Max 35 words per question.`}],{temp:0.4,maxTok:500});return String(r).trim();}
async function feedback(F,qs,ans){const r=await window.tutorAI.chat([{role:'system',content:sysP()},{role:'user',content:`TRADE FACTS: ${JSON.stringify(F)}\n\nQUESTIONS I ASKED:\n${qs}\n\nSTUDENT ANSWERS:\n${ans}\n\nNow give feedback in ${fa()?'Persian':'English'}: (a) one sentence on what the numbers confirm or contradict in each answer, (b) ONE concrete, falsifiable rule the student could test on the next 20 trades (phrase it as "if X then Y, measured by Z"), (c) which Academy lesson to revisit (choose from: market structure, S/R, stop-loss, R-multiple, position sizing, drawdown/circuit breaker, biases, journal, trend following, mean reversion, breakouts, SMC). Max 160 words. No flattery.`}],{temp:0.4,maxTok:600});return String(r).trim();}
/* ---- UI ---- */
function panel(row,x){let box=row.querySelector('.rvBox');if(!box){box=document.createElement('div');box.className='rvBox note';box.style.cssText='margin-top:6px;font-size:12px';row.appendChild(box);}return box;}
async function review(row,x){const t=T();const box=panel(row,x);if(!(window.tutorAI&&window.tutorAI.eff&&window.tutorAI.eff())){box.innerHTML=`<span style="color:var(--red)">${t.noKey}</span>`;return;}
  box.innerHTML=`<div class="hint">${t.loading}</div>`;let F;try{F=await facts(x);}catch(e){box.innerHTML=`<span style="color:var(--red)">${esc(e.message)}</span>`;return;}
  box.innerHTML=factsHtml(F)+`<div class="hint">⏳ 🤖</div>`;let qs;try{qs=await askQuestions(F);}catch(e){box.innerHTML=factsHtml(F)+`<span style="color:var(--red)">${esc(e.message)}</span>`;return;}
  x.review={ts:Date.now(),facts:F,questions:qs};saveReview(x);renderPanel(box,x);}
function renderPanel(box,x){const t=T();const R=x.review;const md=window.learnMd||(s=>'<p>'+esc(s)+'</p>');
  box.innerHTML=factsHtml(R.facts)+`<div class="hint" style="margin-top:6px"><b>${t.q}</b></div><div>${md(R.questions)}</div>`+
   (R.feedback?`<div class="hint" style="margin-top:6px"><b>${t.fb}</b></div><div class="hint" style="white-space:pre-wrap;opacity:.8">${esc(R.answers||'')}</div><div>${md(R.feedback)}</div>`
    :`<textarea class="rvAns" rows="4" placeholder="${t.ans}" style="width:100%;margin-top:6px;background:var(--card2);border:1px solid var(--border);border-radius:8px;color:inherit;padding:8px;font-family:inherit"></textarea><div class="btns"><button class="primary rvSend" style="padding:8px 14px;border:0;border-radius:8px;font-family:inherit">${t.send}</button></div>`);
  const b=box.querySelector('.rvSend');if(b)b.onclick=async()=>{const a=box.querySelector('.rvAns').value.trim();if(!a)return;b.disabled=true;b.textContent='⏳';try{const fb=await feedback(R.facts,R.questions,a);x.review.answers=a;x.review.feedback=fb;saveReview(x);renderPanel(box,x);try{const p=JSON.parse(localStorage.getItem('fc_learn_prog')||'{}');p.reviews=(p.reviews||0)+1;localStorage.setItem('fc_learn_prog',JSON.stringify(p));}catch(e){}}catch(e){b.disabled=false;b.textContent=t.send;alert(e.message);}};}
function saveReview(x){const J=LSJ();const y=J.find(z=>z.id===x.id);if(y){y.review=x.review;SVJ(J);}}
function hook(){const list=$('jList');if(!list)return;const J=LSJ();list.querySelectorAll('.jrow').forEach(row=>{if(row.querySelector('.rvBtn'))return;const x=J.find(z=>z.id==row.dataset.id);if(!x||x.status!=='closed'||!(x.entry>0&&x.sl>0))return;const acts=row.querySelector('.acts');if(!acts)return;
  const b=document.createElement('button');b.className='rvBtn';b.style.cssText='background:var(--card);color:var(--txt);border:1px solid var(--blue,#2962ff)!important';b.textContent=x.review?T().redo:T().btn;b.onclick=()=>review(row,x);acts.insertBefore(b,acts.firstChild);
  if(x.review){const s=document.createElement('button');s.style.cssText='background:var(--card);color:var(--muted);border:1px solid var(--border)!important;flex:0 0 auto';s.textContent='📖';s.title=fa()?'نمایش بازبینی ذخیره‌شده':'show saved review';s.onclick=()=>{const box=panel(row,x);if(box.innerHTML){box.innerHTML='';return;}renderPanel(box,x);};acts.insertBefore(s,b.nextSibling);}});}
/* features.js calls its own local renderJournal (not window.*) from the filter buttons, so a wrapper would miss those renders → observe the list instead */
function boot(){const list=$('jList');if(!list){document.addEventListener('DOMContentLoaded',boot,{once:true});return;}let busy=false;new MutationObserver(()=>{if(busy)return;busy=true;try{hook();}catch(e){}busy=false;}).observe(list,{childList:true});try{hook();}catch(e){}}
boot();
window.tradeReview={facts,hook,_isRound:isRound,_qsym:qsym};
})();
