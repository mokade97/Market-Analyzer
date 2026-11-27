/* ==== learnexam.js (v132 #227): module exams + certificates. An exam = up to 12 questions drawn (seeded by attempt) from the module's own lesson quizzes,
   shuffled options, no explanations until the end. Pass ≥ 80 %. Each pass is stored in fc_learn_prog.exam_<mod>; a certificate (inline SVG, downloadable PNG-free
   SVG file) is issued per module and a final "Academy" certificate when every module is passed. Everything is offline — no AI, no network. ==== */
(function(){
const $=id=>document.getElementById(id);const fa=()=>(localStorage.getItem('fc_lang')||'fa')==='fa';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const prog=()=>{try{return JSON.parse(localStorage.getItem('fc_learn_prog')||'{}');}catch(e){return {};}};const setP=(k,v)=>{const p=prog();p[k]=v;localStorage.setItem('fc_learn_prog',JSON.stringify(p));};
const MODS=()=>window.LEARN_MODULES||[];const PASS=80,NQ=12;
const T=()=>fa()?{exam:'📝 آزمون ماژول',cert:'🏅 گواهی',start:'شروع آزمون',q:'سؤال',of:'از',next:'بعدی',finish:'پایان و نمره',pass:'قبول',fail:'مردود',score:'نمره',retry:'تلاش دوباره',back:'← بازگشت',name:'نام روی گواهی:',dl:'⬇ دانلود گواهی (SVG)',final:'🎓 گواهی پایان دورهٔ آکادمی',finalHint:'با قبولی در همهٔ ماژول‌ها صادر می‌شود',review:'مرور پاسخ‌ها',yours:'پاسخ تو',correct:'درست',rule:`قبولی: حداقل ${PASS}٪. سؤال‌ها از آزمون‌های درس‌های همین ماژول انتخاب و هر بار به‌هم ریخته می‌شوند. توضیح‌ها فقط آخر کار نشان داده می‌شوند.`,few:'این ماژول هنوز سؤال کافی ندارد.',issued:'صادرشده در',certOf:'گواهی تکمیل',academy:'آکادمی ترید — تحلیل‌گر بازار',signed:'نمره',passedAll:'همهٔ ۹ ماژول با موفقیت گذرانده شد'}
 :{exam:'📝 Module exam',cert:'🏅 Certificate',start:'Start exam',q:'Question',of:'of',next:'Next',finish:'Finish & grade',pass:'PASS',fail:'FAIL',score:'Score',retry:'Try again',back:'← Back',name:'Name on certificate:',dl:'⬇ Download certificate (SVG)',final:'🎓 Academy completion certificate',finalHint:'issued once every module is passed',review:'Review answers',yours:'your answer',correct:'correct',rule:`Pass mark ${PASS}%. Questions are drawn from this module's lesson quizzes and reshuffled on every attempt; explanations only at the end.`,few:'This module does not have enough questions yet.',issued:'Issued',certOf:'Certificate of completion',academy:'Trading Academy — Market Analyzer',signed:'Score',passedAll:'All 9 modules passed'};
function rng(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function pool(m){const out=[];m.lessons.forEach(l=>(l.ex||[]).forEach(x=>{if(x.type==='quiz'&&x.opts&&x.a!=null)out.push({q:x.q,opts:x.opts,a:x.a,why:x.why,lesson:l.title});}));return out;}
function build(m,seed){const r=rng(seed);const P=pool(m).slice();for(let i=P.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[P[i],P[j]]=[P[j],P[i]];}
  return P.slice(0,NQ).map(x=>{const idx=x.opts.map((_,i)=>i);for(let i=idx.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]];}return {q:x.q,why:x.why,lesson:x.lesson,opts:idx.map(i=>x.opts[i]),a:idx.indexOf(x.a)};});}
const passed=mid=>{const e=prog()['exam_'+mid];return e&&e.pct>=PASS?e:null;};const allPassed=()=>MODS().length>0&&MODS().every(m=>passed(m.id));
window.learnExam={open,passed,allPassed,certSvg,build,pool};
/* ---- exam view ---- */
let st=null;
function open(root,mid,back){const m=MODS().find(x=>x.id===mid);if(!m)return back();const t=T();const P=pool(m);
  if(P.length<4){root.innerHTML=`<div class="card"><button class="ghost" id="exBack">${t.back}</button><p class="hint">${t.few}</p></div>`;$('exBack').onclick=back;return;}
  st={m,qs:build(m,Date.now()),i:0,ans:[],back,root};renderIntro();}
function renderIntro(){const t=T(),{m,root,back}=st;const prev=prog()['exam_'+m.id];
  root.innerHTML=`<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><b>${t.exam} — ${m.icon} ${esc(fa()?m.title:m.titleEn)}</b><button class="ghost" id="exBack">${t.back}</button></div>
   <p class="hint">${t.rule} · ${st.qs.length} ${t.q}</p>${prev?`<p class="hint">${fa()?'آخرین نتیجه':'Last result'}: <b style="color:${prev.pct>=PASS?'var(--green)':'var(--red)'}">${prev.pct}%</b> · ${new Date(prev.t).toLocaleDateString()}</p>`:''}
   <div class="btns"><button class="primary" id="exStart">${t.start}</button>${prev&&prev.pct>=PASS?`<button class="ghost" id="exCert">${t.cert}</button>`:''}</div></div>`;
  $('exBack').onclick=back;$('exStart').onclick=()=>{st.i=0;st.ans=[];st.qs=build(m,Date.now());renderQ();};if($('exCert'))$('exCert').onclick=()=>renderCert(m,prev);}
function renderQ(){const t=T(),{root,qs,i}=st;const x=qs[i];
  root.innerHTML=`<div class="card"><div class="hint">${t.q} ${i+1} ${t.of} ${qs.length}</div><div style="height:4px;background:var(--card2);border-radius:3px;margin:6px 0;overflow:hidden"><div style="height:100%;width:${Math.round(i/qs.length*100)}%;background:var(--accent,#3b82f6)"></div></div>
   <p><b>${esc(x.q)}</b></p><div style="display:flex;flex-direction:column;gap:6px">${x.opts.map((o,j)=>`<button class="ghost exOpt" data-j="${j}" style="text-align:start;padding:10px">${esc(o)}</button>`).join('')}</div></div>`;
  root.querySelectorAll('.exOpt').forEach(b=>b.onclick=()=>{st.ans[i]=+b.dataset.j;if(i+1<qs.length){st.i++;renderQ();}else grade();});}
function grade(){const t=T(),{m,qs,ans,root}=st;const ok=qs.filter((x,i)=>ans[i]===x.a).length;const pct=Math.round(ok/qs.length*100);const rec={pct,ok,n:qs.length,t:Date.now(),attempts:((prog()['exam_'+m.id]||{}).attempts||0)+1};
  const prev=prog()['exam_'+m.id];if(!prev||pct>=prev.pct||pct>=PASS)setP('exam_'+m.id,Object.assign({},rec,{best:Math.max(pct,prev&&prev.best||0)}));else setP('exam_'+m.id,Object.assign({},prev,{attempts:rec.attempts}));
  const pass=pct>=PASS;
  root.innerHTML=`<div class="card"><div style="text-align:center;padding:10px"><div style="font-size:40px">${pass?'🏅':'📚'}</div><div style="font-size:26px;font-weight:800;color:${pass?'var(--green)':'var(--red)'}">${pct}%</div><div class="hint">${t.score}: ${ok}/${qs.length} · <b>${pass?t.pass:t.fail}</b></div></div>
   <div class="btns">${pass?`<button class="primary" id="exCert">${t.cert}</button>`:''}<button class="ghost" id="exRetry">${t.retry}</button><button class="ghost" id="exBack">${t.back}</button></div>
   <details style="margin-top:8px"><summary>${t.review}</summary>${qs.map((x,i)=>`<div class="note" style="margin-top:6px;border-inline-start:3px solid ${ans[i]===x.a?'var(--green)':'var(--red)'}"><b>${i+1}. ${esc(x.q)}</b><div class="hint">${t.yours}: ${esc(x.opts[ans[i]]??'—')} ${ans[i]===x.a?'✅':`· ${t.correct}: ${esc(x.opts[x.a])} ❌`}</div>${x.why?`<div class="hint">${esc(x.why)}</div>`:''}<div class="hint" style="opacity:.6">${esc(x.lesson)}</div></div>`).join('')}</details></div>`;
  $('exRetry').onclick=()=>{st.qs=build(m,Date.now());st.i=0;st.ans=[];renderQ();};$('exBack').onclick=st.back;if($('exCert'))$('exCert').onclick=()=>renderCert(m,prog()['exam_'+m.id]);}
/* ---- certificate ---- */
function certSvg({name,title,sub,score,date,id}){const W=900,H=620;const wrap=(s,n)=>{s=String(s);return s.length>n?s.slice(0,n-1)+'…':s;};
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#1e293b"/></linearGradient><linearGradient id="a" x1="0" x2="1"><stop offset="0" stop-color="#f59e0b"/><stop offset="1" stop-color="#fbbf24"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/><rect x="18" y="18" width="${W-36}" height="${H-36}" fill="none" stroke="url(#a)" stroke-width="3" rx="14"/><rect x="30" y="30" width="${W-60}" height="${H-60}" fill="none" stroke="#f59e0b55" stroke-width="1" rx="10"/>
<text x="${W/2}" y="92" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="#94a3b8" letter-spacing="4">${esc(T().academy)}</text>
<text x="${W/2}" y="150" text-anchor="middle" font-family="Georgia,serif" font-size="36" font-weight="700" fill="#fbbf24">${esc(T().certOf)}</text>
<text x="${W/2}" y="250" text-anchor="middle" font-family="Georgia,serif" font-size="44" font-weight="700" fill="#f8fafc">${esc(wrap(name,40))}</text>
<line x1="${W/2-220}" y1="270" x2="${W/2+220}" y2="270" stroke="#f59e0b" stroke-width="1"/>
<text x="${W/2}" y="320" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#e2e8f0">${esc(wrap(title,60))}</text>
<text x="${W/2}" y="356" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#94a3b8">${esc(wrap(sub,90))}</text>
<circle cx="${W/2}" cy="440" r="46" fill="none" stroke="url(#a)" stroke-width="4"/><text x="${W/2}" y="450" text-anchor="middle" font-family="sans-serif" font-size="26" font-weight="700" fill="#fbbf24">${esc(score)}</text>
<text x="80" y="${H-70}" font-family="sans-serif" font-size="14" fill="#94a3b8">${esc(T().issued)}: ${esc(date)}</text><text x="${W-80}" y="${H-70}" text-anchor="end" font-family="monospace" font-size="12" fill="#64748b">ID ${esc(id)}</text></svg>`;}
function renderCert(m,rec){const t=T();const key='fc_cert_name';let name=localStorage.getItem(key)||'';if(!name){name=prompt(t.name,'')||'';if(!name)return;localStorage.setItem(key,name);}
  const final=!m;const title=final?t.final.replace(/^🎓 /,''):(m.icon+' '+(fa()?m.title:m.titleEn));const sub=final?t.passedAll:(fa()?'آزمون ماژول با نمرهٔ ':'Module exam passed with ')+rec.pct+'%';
  const id=(final?'FINAL':m.id).toUpperCase()+'-'+(rec.t||Date.now()).toString(36).toUpperCase();const svg=certSvg({name,title,sub,score:(final?'100':rec.pct)+'%',date:new Date(rec.t||Date.now()).toISOString().slice(0,10),id});
  const root=st?st.root:$('learnRoot');const back=st?st.back:()=>{window.learnUI&&learnUI.render();};
  root.innerHTML=`<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><b>${t.cert}</b><button class="ghost" id="exBack">${t.back}</button></div><div style="margin-top:8px;border-radius:10px;overflow:hidden;direction:ltr">${svg.replace('<svg ','<svg style="width:100%;height:auto;display:block" ')}</div>
   <div class="btns"><a class="primary" id="exDl" download="certificate-${id}.svg" href="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" style="padding:10px 16px;border-radius:10px;text-decoration:none;display:inline-block">${t.dl}</a><button class="ghost" id="exName">✏️ ${fa()?'تغییر نام':'Change name'}</button></div></div>`;
  $('exBack').onclick=back;$('exName').onclick=()=>{const n=prompt(t.name,name);if(n){localStorage.setItem(key,n);renderCert(m,rec);}};}
window.learnExam.renderCert=renderCert;
})();
