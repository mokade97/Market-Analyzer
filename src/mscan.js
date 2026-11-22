/* v117: manual scan (condition builder) for the screener — alphakademi-style.
   indicator [n bars ago] operator (number | indicator × k), AND/OR, presets, saved filters, CSV.
   Uses screener.js globals: rows, klinesAny, pool, openDetail, watch, t(), $(), escH, toast, lang. */
(function(){
const MS_T={fa:{title:'🔬 اسکن دستی (شرط‌ساز)',hint:'شرط‌ها روی کندل‌های بسته‌شده‌ی همان تایم‌فریم ارزیابی می‌شوند (کندل ۰ = آخرین کندل بسته‌شده). جهان اسکن = نمادهای آخرین «اسکن بازار» یا واچ‌لیست. مقدار «n کندل قبل» برای شرط‌های تاریخی است.',presets:'فیلترهای آماده:',conds:'شرط‌ها',add:'+ شرط',and:'همه (AND)',or:'هرکدام (OR)',run:'🔍 اجرای اسکن',tf:'تایم‌فریم',uni:'جهان',uniScan:'نمادهای اسکن‌شده',uniWatch:'واچ‌لیست ★',save:'💾 ذخیره فیلتر',saved:'ذخیره‌شده‌ها',csv:'⬇ CSV',del:'حذف',ago:'کندل قبل',num:'عدد',ind:'اندیکاتور',k:'× ضریب',noUni:'اول «اسکن بازار» را بزن یا چند نماد ★ کن.',noCond:'حداقل یک شرط بساز.',running:'در حال بررسی',done:'نتیجه',none:'هیچ نمادی با این شرط‌ها پیدا نشد.',sym:'نماد',price:'قیمت',chg:'24h',name:'نام فیلتر:',fail:'خطا/داده ناکافی',chart:'📈',empty:'هنوز فیلتری ذخیره نشده.'},
 en:{title:'🔬 Manual scan (condition builder)',hint:'Conditions are evaluated on closed candles of the chosen timeframe (bar 0 = last closed bar). Universe = symbols from the last "Scan market" or your watchlist. "n bars ago" is for historical conditions.',presets:'Presets:',conds:'Conditions',add:'+ condition',and:'ALL (AND)',or:'ANY (OR)',run:'🔍 Run scan',tf:'Timeframe',uni:'Universe',uniScan:'scanned symbols',uniWatch:'watchlist ★',save:'💾 Save filter',saved:'Saved',csv:'⬇ CSV',del:'delete',ago:'bars ago',num:'number',ind:'indicator',k:'× factor',noUni:'Run "Scan market" first or star a few symbols.',noCond:'Add at least one condition.',running:'checking',done:'result',none:'No symbol matches these conditions.',sym:'Symbol',price:'Price',chg:'24h',name:'Filter name:',fail:'error / not enough data',chart:'📈',empty:'No saved filters yet.'}};
const $=id=>document.getElementById(id);const t=()=>T[lang];const X=()=>window.scrX;const rowsOf=()=>X().rows();
const L=()=>MS_T[typeof lang!=='undefined'&&MS_T[lang]?lang:'fa'];
/* ---- indicator library: name -> series(k) (arrays aligned with k) ---- */
const sma=(a,p)=>a.map((_,i)=>{if(i<p-1)return null;let s=0;for(let j=i-p+1;j<=i;j++)s+=a[j];return s/p;});
const emaS=(a,p)=>{const k=2/(p+1);let e=null;return a.map(v=>e=e===null?v:v*k+e*(1-k));};
const rsiS=(c,p)=>{const out=new Array(c.length).fill(null);if(c.length<p+2)return out;let g=0,l=0;for(let i=1;i<=p;i++){const d=c[i]-c[i-1];d>0?g+=d:l-=d;}g/=p;l/=p;out[p]=l===0?100:100-100/(1+g/l);for(let i=p+1;i<c.length;i++){const d=c[i]-c[i-1];g=(g*(p-1)+(d>0?d:0))/p;l=(l*(p-1)+(d<0?-d:0))/p;out[i]=l===0?100:100-100/(1+g/l);}return out;};
const atrS=(k,p)=>{const tr=k.map((x,i)=>i?Math.max(x.h-x.l,Math.abs(x.h-k[i-1].c),Math.abs(x.l-k[i-1].c)):x.h-x.l);let a=null;return tr.map((v,i)=>{if(i<p)return null;if(a===null){let s=0;for(let j=1;j<=p;j++)s+=tr[j];a=s/p;return a;}a=(a*(p-1)+v)/p;return a;});};
const hiS=(k,p,f,excl)=>k.map((_,i)=>{const e=excl?i-1:i,s=e-p+1;if(s<0)return null;let m=f==='h'?-Infinity:Infinity;for(let j=s;j<=e;j++){const v=k[j][f];if(f==='h'?v>m:v<m)m=v;}return m;});
function supertrend(k,p,m){const atr=atrS(k,p);const n=k.length,st=new Array(n).fill(null);let up=null,dn=null,dir=1;for(let i=0;i<n;i++){if(atr[i]==null)continue;const hl2=(k[i].h+k[i].l)/2;let bu=hl2-m*atr[i],bd=hl2+m*atr[i];if(up!=null&&k[i-1].c>up)bu=Math.max(bu,up);if(dn!=null&&k[i-1].c<dn)bd=Math.min(bd,dn);if(up==null){up=bu;dn=bd;st[i]=k[i].c>bd?bu:bd;dir=k[i].c>bd?1:-1;continue;}
  if(dir===1&&k[i].c<up)dir=-1;else if(dir===-1&&k[i].c>dn)dir=1;up=bu;dn=bd;st[i]=dir===1?up:dn;}return st;}
function adxS(k,p){const n=k.length,out=new Array(n).fill(null);if(n<2*p+1)return out;const tr=[],pd=[],md=[];for(let i=1;i<n;i++){const up=k[i].h-k[i-1].h,dn=k[i-1].l-k[i].l;pd.push(up>dn&&up>0?up:0);md.push(dn>up&&dn>0?dn:0);tr.push(Math.max(k[i].h-k[i].l,Math.abs(k[i].h-k[i-1].c),Math.abs(k[i].l-k[i-1].c)));}
  let st=0,sp=0,sm=0;for(let i=0;i<p;i++){st+=tr[i];sp+=pd[i];sm+=md[i];}const dx=[];for(let i=p;i<tr.length;i++){st=st-st/p+tr[i];sp=sp-sp/p+pd[i];sm=sm-sm/p+md[i];const dp=100*sp/st,dm=100*sm/st;dx.push(100*Math.abs(dp-dm)/((dp+dm)||1));}
  let a=null;for(let i=0;i<dx.length;i++){if(i<p-1)continue;if(a===null){let s=0;for(let j=0;j<p;j++)s+=dx[j];a=s/p;}else a=(a*(p-1)+dx[i])/p;out[i+p+1]=a;}return out;}
const IND={close:k=>k.map(x=>x.c),open:k=>k.map(x=>x.o),high:k=>k.map(x=>x.h),low:k=>k.map(x=>x.l),vol:k=>k.map(x=>x.v),
 ema9:k=>emaS(k.map(x=>x.c),9),ema20:k=>emaS(k.map(x=>x.c),20),ema50:k=>emaS(k.map(x=>x.c),50),ema200:k=>emaS(k.map(x=>x.c),200),
 sma20:k=>sma(k.map(x=>x.c),20),sma50:k=>sma(k.map(x=>x.c),50),sma150:k=>sma(k.map(x=>x.c),150),sma200:k=>sma(k.map(x=>x.c),200),
 rsi14:k=>rsiS(k.map(x=>x.c),14),rsi2:k=>rsiS(k.map(x=>x.c),2),atr14:k=>atrS(k,14),atrPct:k=>{const a=atrS(k,14);return a.map((v,i)=>v==null?null:100*v/k[i].c);},
 bbU:k=>bb(k).u,bbL:k=>bb(k).l,bbW:k=>bb(k).w,macdH:k=>{const c=k.map(x=>x.c),f=emaS(c,12),s=emaS(c,26),m=f.map((v,i)=>v-s[i]),sg=emaS(m,9);return m.map((v,i)=>i<34?null:v-sg[i]);},
 hh20:k=>hiS(k,20,'h',true),ll20:k=>hiS(k,20,'l',true),hh52:k=>hiS(k,Math.min(250,k.length-2),'h',true),ll52:k=>hiS(k,Math.min(250,k.length-2),'l',true),
 volSma20:k=>sma(k.map(x=>x.v),20),relVol:k=>{const s=sma(k.map(x=>x.v),20);return k.map((x,i)=>s[i]?x.v/s[i]:null);},chg1:k=>k.map((x,i)=>i?100*(x.c/k[i-1].c-1):null),chg5:k=>k.map((x,i)=>i>=5?100*(x.c/k[i-5].c-1):null),chg20:k=>k.map((x,i)=>i>=20?100*(x.c/k[i-20].c-1):null),
 supertrend:k=>supertrend(k,10,3),adx14:k=>adxS(k,14),body:k=>k.map(x=>100*Math.abs(x.c-x.o)/x.c),range:k=>k.map(x=>100*(x.h-x.l)/x.c)};
const _bbc=new WeakMap();function bb(k){let r=_bbc.get(k);if(r)return r;const c=k.map(x=>x.c),m=sma(c,20);const sd=c.map((_,i)=>{if(i<19)return null;let v=0;for(let j=i-19;j<=i;j++)v+=(c[j]-m[i])**2;return Math.sqrt(v/20);});r={u:m.map((v,i)=>v==null?null:v+2*sd[i]),l:m.map((v,i)=>v==null?null:v-2*sd[i]),w:m.map((v,i)=>v==null?null:400*sd[i]/v)};_bbc.set(k,r);return r;}
const IND_LBL={close:'Close',open:'Open',high:'High',low:'Low',vol:'Volume',ema9:'EMA 9',ema20:'EMA 20',ema50:'EMA 50',ema200:'EMA 200',sma20:'SMA 20',sma50:'SMA 50',sma150:'SMA 150',sma200:'SMA 200',rsi14:'RSI 14',rsi2:'RSI 2',atr14:'ATR 14',atrPct:'ATR %',bbU:'BB Upper',bbL:'BB Lower',bbW:'BB Width %',macdH:'MACD Hist',hh20:'High 20 (prev)',ll20:'Low 20 (prev)',hh52:'52w High (prev)',ll52:'52w Low (prev)',volSma20:'Vol SMA 20',relVol:'Rel. Volume',chg1:'Change 1 bar %',chg5:'Change 5 bars %',chg20:'Change 20 bars %',supertrend:'Supertrend 10/3',adx14:'ADX 14',body:'Candle body %',range:'Candle range %'};
const OPS=['>','<','>=','<=','crossUp','crossDown'];
const PRESETS=[
 {id:'brk52',n:{fa:'🚀 شکست سقف ۵۲ هفته',en:'🚀 52w breakout'},tf:'1D',logic:'and',c:[{a:'close',n:0,op:'>',bt:'ind',b:'hh52',k:1},{a:'relVol',n:0,op:'>',bt:'num',b:1.5}]},
 {id:'ceil',n:{fa:'🔥 بمب مومنتوم',en:'🔥 Momentum bomb'},tf:'1D',logic:'and',c:[{a:'chg1',n:0,op:'>',bt:'num',b:7},{a:'relVol',n:0,op:'>',bt:'num',b:2}]},
 {id:'bbsq',n:{fa:'🧨 فشردگی بولینگر',en:'🧨 BB squeeze'},tf:'1D',logic:'and',c:[{a:'bbW',n:0,op:'<',bt:'num',b:8},{a:'close',n:0,op:'>',bt:'ind',b:'ema50',k:1}]},
 {id:'smart',n:{fa:'🐋 پول هوشمند (حجم ۲× + EMA9)',en:'🐋 Smart money (vol 2× + EMA9)'},tf:'1D',logic:'and',c:[{a:'vol',n:0,op:'>',bt:'ind',b:'volSma20',k:2},{a:'close',n:0,op:'>',bt:'ind',b:'ema9',k:1}]},
 {id:'qulla',n:{fa:'🏄 Qullamaggie (شکست پس از فشردگی)',en:'🏄 Qullamaggie breakout'},tf:'1D',logic:'and',c:[{a:'close',n:0,op:'>',bt:'ind',b:'hh20',k:1},{a:'chg20',n:1,op:'>',bt:'num',b:20},{a:'close',n:0,op:'>',bt:'ind',b:'ema20',k:1},{a:'relVol',n:0,op:'>',bt:'num',b:1.5}]},
 {id:'stup',n:{fa:'🟢 تغییر فاز سوپرترند',en:'🟢 Supertrend flip up'},tf:'4H',logic:'and',c:[{a:'close',n:0,op:'crossUp',bt:'ind',b:'supertrend',k:1}]},
 {id:'gold',n:{fa:'✨ کراس طلایی EMA20/50',en:'✨ EMA20/50 golden cross'},tf:'4H',logic:'and',c:[{a:'ema20',n:0,op:'crossUp',bt:'ind',b:'ema50',k:1}]},
 {id:'rsib',n:{fa:'↩️ برگشت RSI از اشباع فروش',en:'↩️ RSI oversold bounce'},tf:'4H',logic:'and',c:[{a:'rsi14',n:0,op:'crossUp',bt:'num',b:30},{a:'close',n:0,op:'>',bt:'ind',b:'ema200',k:1}]},
 {id:'tt',n:{fa:'🏆 روند مینروینی (ساده)',en:'🏆 Minervini trend (simple)'},tf:'1D',logic:'and',c:[{a:'close',n:0,op:'>',bt:'ind',b:'sma50',k:1},{a:'sma50',n:0,op:'>',bt:'ind',b:'sma150',k:1},{a:'sma150',n:0,op:'>',bt:'ind',b:'sma200',k:1},{a:'close',n:0,op:'>',bt:'ind',b:'ll52',k:1.3}]}];
/* ---- state ---- */
let st={tf:'1D',uni:'scan',logic:'and',c:[{a:'close',n:0,op:'>',bt:'ind',b:'ema20',k:1}]};
const SK='fc_mscan';const savedGet=()=>{try{const a=JSON.parse(localStorage.getItem(SK)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}};
const num=(v,d)=>v==null||!isFinite(v)?'—':Math.abs(v)>=1000?v.toLocaleString('en-US',{maximumFractionDigits:0}):+v.toPrecision(5)+'';
/* ---- evaluation ---- */
function evalCond(k,S,c){const L0=k.length-1,i=L0-(+c.n||0);if(i<1)return {ok:false,av:null,bv:null};const A=S(c.a);const B=c.bt==='ind'?S(c.b):null;const bval=j=>c.bt==='ind'?(B[j]==null?null:B[j]*(+c.k||1)):+c.b;const av=A[i],bv=bval(i);if(av==null||bv==null||!isFinite(av)||!isFinite(bv))return {ok:false,av,bv};
  let ok;switch(c.op){case '>':ok=av>bv;break;case '<':ok=av<bv;break;case '>=':ok=av>=bv;break;case '<=':ok=av<=bv;break;case 'crossUp':{const ap=A[i-1],bp=bval(i-1);ok=ap!=null&&bp!=null&&av>bv&&ap<=bp;break;}case 'crossDown':{const ap=A[i-1],bp=bval(i-1);ok=ap!=null&&bp!=null&&av<bv&&ap>=bp;break;}default:ok=false;}return {ok,av,bv};}
function evalSym(k){const cache={};const S=n=>cache[n]||(cache[n]=IND[n](k));const parts=st.c.map(c=>evalCond(k,S,c));const pass=st.logic==='or'?parts.some(p=>p.ok):parts.every(p=>p.ok);return {pass,parts};}
window.__mscanEval=(k,cfg)=>{const o=st;st=Object.assign({},st,cfg);try{return evalSym(k);}finally{st=o;}}; /* test hook */
/* ---- UI ---- */
let box,running=false,lastRes=[];
function condRow(c,i){const T=L();const indOpts=sel=>Object.keys(IND).map(x=>`<option value="${x}" ${x===sel?'selected':''}>${IND_LBL[x]}</option>`).join('');
  return `<div class="msRow" data-i="${i}" style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:4px 0;padding:6px;border:1px solid var(--border,#ddd);border-radius:8px">
   <select data-f="a" style="flex:1;min-width:110px">${indOpts(c.a)}</select>
   <span style="display:flex;align-items:center;gap:2px;font-size:11px"><input data-f="n" type="number" min="0" max="200" value="${+c.n||0}" style="width:48px;padding:4px">${T.ago}</span>
   <select data-f="op" style="width:auto">${OPS.map(o=>`<option ${o===c.op?'selected':''}>${o}</option>`).join('')}</select>
   <select data-f="bt" style="width:auto"><option value="num" ${c.bt==='num'?'selected':''}>${T.num}</option><option value="ind" ${c.bt==='ind'?'selected':''}>${T.ind}</option></select>
   ${c.bt==='ind'?`<select data-f="b" style="flex:1;min-width:110px">${indOpts(c.b)}</select><span style="display:flex;align-items:center;gap:2px;font-size:11px"><input data-f="k" type="number" step="0.01" value="${c.k==null?1:c.k}" style="width:56px;padding:4px">${T.k}</span>`:`<input data-f="b" type="number" step="any" value="${c.b==null?0:c.b}" style="width:90px;padding:4px">`}
   <button class="ghost" data-del="${i}" style="padding:2px 8px">✕</button></div>`;}
function render(){if(!box)return;const T=L();const saved=savedGet();
  box.innerHTML=`<div class="hint">${T.hint}</div>
  <div class="hint" style="margin:6px 0 2px">${T.presets}</div><div class="seg wrap" id="msPresets">${PRESETS.map(p=>`<button data-p="${p.id}">${p.n[lang==='en'?'en':'fa']}</button>`).join('')}</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
   <div class="field" style="flex:1;min-width:120px"><label>${T.tf}</label><select id="msTf">${['15m','1H','4H','1D'].map(x=>`<option ${x===st.tf?'selected':''}>${x}</option>`).join('')}</select></div>
   <div class="field" style="flex:1;min-width:140px"><label>${T.uni}</label><select id="msUni"><option value="scan" ${st.uni==='scan'?'selected':''}>${T.uniScan}</option><option value="watch" ${st.uni==='watch'?'selected':''}>${T.uniWatch}</option></select></div>
   <div class="field" style="flex:1;min-width:120px"><label>${T.conds}</label><select id="msLogic"><option value="and" ${st.logic==='and'?'selected':''}>${T.and}</option><option value="or" ${st.logic==='or'?'selected':''}>${T.or}</option></select></div></div>
  <div id="msConds">${st.c.map(condRow).join('')}</div>
  <div class="btns" style="margin-top:6px;flex-wrap:wrap"><button class="ghost" id="msAdd">${T.add}</button><button class="primary" id="msRun">${T.run}</button><button class="ghost" id="msSave">${T.save}</button><button class="ghost" id="msCsv" ${lastRes.length?'':'disabled'}>${T.csv}</button></div>
  ${saved.length?`<div class="hint" style="margin-top:6px">${T.saved}:</div><div class="seg wrap">${saved.map((s,i)=>`<button data-s="${i}" title="${escH(s.name)}">${escH(s.name)}</button><button data-sd="${i}" class="ghost" style="padding:2px 6px" title="${T.del}">✕</button>`).join('')}</div>`:''}
  <div class="hint" id="msStatus" style="margin-top:6px"></div><div id="msOut" style="overflow:auto"></div>`;
  box.querySelectorAll('#msPresets button').forEach(b=>b.onclick=()=>{const p=PRESETS.find(x=>x.id===b.dataset.p);st.tf=p.tf;st.logic=p.logic;st.c=JSON.parse(JSON.stringify(p.c));render();run();});
  $('msTf').onchange=e=>st.tf=e.target.value;$('msUni').onchange=e=>st.uni=e.target.value;$('msLogic').onchange=e=>st.logic=e.target.value;
  $('msAdd').onclick=()=>{st.c.push({a:'close',n:0,op:'>',bt:'num',b:0});render();};
  box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{st.c.splice(+b.dataset.del,1);if(!st.c.length)st.c.push({a:'close',n:0,op:'>',bt:'ind',b:'ema20',k:1});render();});
  box.querySelectorAll('.msRow').forEach(r=>r.querySelectorAll('[data-f]').forEach(el=>el.onchange=()=>{const c=st.c[+r.dataset.i],f=el.dataset.f;if(f==='bt'){c.bt=el.value;c.b=c.bt==='ind'?'ema20':0;c.k=1;render();return;}c[f]=f==='a'||f==='op'||(f==='b'&&c.bt==='ind')?el.value:+el.value;}));
  $('msRun').onclick=()=>run();
  $('msSave').onclick=()=>{const name=prompt(L().name,st.c.map(c=>IND_LBL[c.a]+' '+c.op+' '+(c.bt==='ind'?IND_LBL[c.b]+(c.k!=1?'×'+c.k:''):c.b)).join(st.logic==='or'?' | ':' & ').slice(0,60));if(!name)return;const s=savedGet();s.push({name,st:JSON.parse(JSON.stringify(st))});localStorage.setItem(SK,JSON.stringify(s.slice(-30)));render();};
  box.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const s=savedGet()[+b.dataset.s];if(!s)return;st=JSON.parse(JSON.stringify(s.st));render();run();});
  box.querySelectorAll('[data-sd]').forEach(b=>b.onclick=()=>{const s=savedGet();s.splice(+b.dataset.sd,1);localStorage.setItem(SK,JSON.stringify(s));render();});
  $('msCsv').onclick=csv;if(lastRes.length)renderOut();}
function universe(){const w=X().watch(),rows=rowsOf();const base=st.uni==='watch'?w.map(s=>rows.find(r=>r.symbol===s)||{symbol:s,display:s}):rows.filter(r=>!r.metal||w.includes(r.symbol));return base.filter(r=>/^[A-Z0-9._:\-]{1,40}$/i.test(String(r.symbol)));}
async function run(){if(running)return;const T=L();if(!st.c.length){toast(T.noCond);return;}const U=universe();if(!U.length){$('msStatus').textContent=T.noUni;return;}running=true;$('msRun').disabled=true;lastRes=[];$('msOut').innerHTML='';let done=0,fails=0;$('msStatus').innerHTML=`<span class="spin"></span> ${T.running} 0/${U.length}`;
  const t0=Date.now();const bars=st.c.some(c=>/52|200|150/.test(c.a+c.b))||st.tf==='1D'?300:260;
  const res=await X().pool(U,4,async r=>{try{const k=await window.klinesAny(r.symbol,st.tf,bars);if(!k||k.length<60){fails++;return null;}const kk=k.slice(0,-1); /* drop the forming candle */const e=evalSym(kk);return e.pass?{r,k:kk,parts:e.parts,price:kk[kk.length-1].c}:null;}catch(e){fails++;return null;}finally{done++;if(done%3===0||done===U.length)$('msStatus').innerHTML=`<span class="spin"></span> ${T.running} ${done}/${U.length}`;}});
  lastRes=res.filter(Boolean);running=false;$('msRun').disabled=false;$('msCsv').disabled=!lastRes.length;
  $('msStatus').textContent=`${T.done}: ${lastRes.length}/${U.length} · ${st.tf} · ${((Date.now()-t0)/1000).toFixed(1)}s`+(fails?` · ${T.fail}: ${fails}`:'');renderOut();}
function renderOut(){const T=L();const out=$('msOut');if(!lastRes.length){out.innerHTML=`<div class="hint">${T.none}</div>`;return;}
  const hdr=st.c.map((c,i)=>`<th title="${escH(IND_LBL[c.a]+' '+c.op+' '+(c.bt==='ind'?IND_LBL[c.b]+'×'+(c.k==null?1:c.k):c.b))}">${i+1}: ${IND_LBL[c.a]}${+c.n?`[-${c.n}]`:''}</th>`).join('');
  out.innerHTML=`<table style="width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap"><thead><tr style="text-align:start"><th>${T.sym}</th><th>${T.price}</th><th>${T.chg}</th>${hdr}<th></th></tr></thead><tbody>${lastRes.map(x=>`<tr data-s="${escH(x.r.symbol)}" style="border-top:1px solid var(--border,#eee);cursor:pointer"><td><b>${escH(x.r.display||x.r.symbol)}</b></td><td>${num(x.price)}</td><td style="color:${(x.r.change24||0)>=0?'var(--up,#0a0)':'var(--dn,#c00)'}">${x.r.change24==null?'—':(x.r.change24>=0?'+':'')+(+x.r.change24).toFixed(1)+'%'}</td>${x.parts.map(p=>`<td style="${p.ok?'':'opacity:.5'}">${num(p.av)}<span style="opacity:.6"> / ${num(p.bv)}</span></td>`).join('')}<td><button class="ghost" data-ch="${escH(x.r.symbol)}" style="padding:2px 6px">${T.chart}</button></td></tr>`).join('')}</tbody></table>`;
  out.querySelectorAll('tr[data-s]').forEach(tr=>tr.onclick=e=>{if(e.target.dataset.ch){openChart(e.target.dataset.ch);return;}X().openDetail(tr.dataset.s);});}
function openChart(sym){try{let q=String(sym).toUpperCase().replace(/[-_:.]?(PERP|SWAP|\.P)$/,'').replace(/-USDT.*$/,'USDT').replace(/[^A-Z0-9]/g,'');if(!/USDT$/.test(q))q+='USDT';$('tvSym').value=q.replace(/USDT$/,'');const iv={'15m':'15','1H':'60','4H':'240','1D':'D'}[st.tf];if(iv)$('tvInt').value=iv;window.openPage('tv');if(typeof loadTv==='function')loadTv();if(window.updToolsSym)updToolsSym();toast((t().chartOpened||'')+' '+q);}catch(e){toast(e.message);}}
function csv(){if(!lastRes.length)return;const esc=v=>`"${String(v??'').replace(/"/g,'""')}"`;const head=['symbol','price','change24',...st.c.flatMap((c,i)=>[`c${i+1}_${c.a}`,`c${i+1}_ref`])];const lines=[head.join(','),...lastRes.map(x=>[x.r.symbol,x.price,x.r.change24??'',...x.parts.flatMap(p=>[p.av??'',p.bv??''])].map(esc).join(','))];
  const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`mscan_${st.tf}_${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);}
function init(){box=document.getElementById('mscanBox');if(!box)return;const det=box.closest('details');const sum=det&&det.querySelector('summary');if(sum)sum.textContent=L().title;if(det&&!det.open){det.addEventListener('toggle',()=>{if(det.open&&!box.children.length)render();},{once:false});}else render();
  document.addEventListener('fc:lang',()=>{if(sum)sum.textContent=L().title;if(box.children.length)render();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.mscan={run,render,PRESETS,IND,state:()=>st,set:s=>{st=Object.assign(st,s);render();}};
})();
