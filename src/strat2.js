/* ==== strat2.js (v125): extra backtest strategies (QUEUE List 1 · group C) registered into btStudio.STR.
   Uses btStudio.I (indicator cache) + btStudio.K (bars). Marker-based ones evaluate the chart indicator once per dataset. ==== */
(function(){
const B=window.btStudio;if(!B)return;const STR=B.STR,I=B.I;const P=(label,def,min,max,step,labelEn)=>({label,labelEn,def,min,max,step});
const K=()=>B.K;
/* per-dataset cache for ind2 calcs (keyed by bars identity) */
let CK=null,CC={};function indCalc(id){const k=K();if(CK!==k){CK=k;CC={};}if(CC[id])return CC[id];const d=window.LWChart&&window.LWChart.IND[id];let r=null;try{r=d&&d.calc?d.calc(k):null;}catch(e){r=null;}
 const byT=new Map();k.forEach((b,i)=>byT.set(b.t,i));const mk=new Array(k.length).fill(null);((r&&r._markers)||[]).forEach(m=>{const i=byT.get(m.t);if(i!=null)mk[i]=(mk[i]||[]).concat([m]);});CC[id]={r,mk};return CC[id];}
const markerSig=(id,test)=>(p,i)=>{const M=indCalc(id).mk[i];if(!M)return null;for(const m of M){const s=test(m,p);if(s)return s;}return null;};
const CUSTOM=STR.CUSTOM;delete STR.CUSTOM;
/* 22. Ma Deuce (ICT): range → sweep of range edge → market-structure shift → entry */
STR.MADEUCE={name:'Ma Deuce (رنج + سوییپ + MSS)',nameEn:'Ma Deuce (range + sweep + MSS)',params:{len:P('طول رنج',20,10,60,2,'Range length'),w:P('حداکثر عرض رنج ×ATR',3.2,1.5,6,0.1,'Max range width ×ATR'),wait:P('مهلت MSS (کندل)',8,3,20,1,'MSS window (bars)')},overlays:()=>[],
 sig:(p,i)=>{const k=K();if(i<p.len+p.wait+5)return null;const A=I('atr',14);if(A[i]==null)return null;
  /* look back for a sweep bar s within the last `wait` bars */
  for(let s=i-1;s>=i-p.wait;s--){let H=-Infinity,L=Infinity;for(let j=s-p.len;j<s;j++){H=Math.max(H,k[j].h);L=Math.min(L,k[j].l);}if(H-L>p.w*A[s])continue;const b=k[s];
   const swL=b.l<L&&b.c>L,swH=b.h>H&&b.c<H;if(!swL&&!swH)continue;
   if(swL){let mh=-Infinity;for(let j=s-3;j<=s;j++)mh=Math.max(mh,k[j].h);let brk=false;for(let j=s+1;j<=i;j++){if(k[j].c>mh){brk=j===i;break;}}if(brk)return 'LONG';}
   if(swH){let ml=Infinity;for(let j=s-3;j<=s;j++)ml=Math.min(ml,k[j].l);let brk=false;for(let j=s+1;j<=i;j++){if(k[j].c<ml){brk=j===i;break;}}if(brk)return 'SHORT';}}
  return null;}};
/* 23. Time-window range breakout (algojan / Roboquant) */
STR.TWRB={name:'شکست رنج پنجرهٔ زمانی (UTC)',nameEn:'Time-window range breakout (UTC)',params:{h:P('ساعت شروع UTC',0,0,23,1,'Start hour UTC'),m:P('دقیقهٔ شروع',0,0,45,15,'Start minute'),dur:P('طول پنجره (دقیقه)',60,15,480,15,'Window length (min)'),minPct:P('حداقل عرض رنج ٪',0.2,0,3,0.05,'Min range %'),maxPct:P('حداکثر عرض رنج ٪',3,0.5,10,0.25,'Max range %'),rev:P('حالت معکوس (۰/۱)',0,0,1,1,'Reverse mode (0/1)'),exp:P('اعتبار تا N ساعت بعد',8,1,24,1,'Valid for N hours')},overlays:()=>[],
 sig:(p,i)=>{const k=K();const b=k[i];const d=new Date(b.t);const day=Math.floor(b.t/864e5);const ws=day*864e5+(p.h*60+p.m)*6e4,we=ws+p.dur*6e4;if(b.t<we)return null;if(b.t>we+p.exp*36e5)return null;
  let H=-Infinity,L=Infinity,cnt=0;for(let j=i-1;j>=0&&k[j].t>=ws-p.dur*6e4;j--){if(k[j].t>=ws&&k[j].t<we){H=Math.max(H,k[j].h);L=Math.min(L,k[j].l);cnt++;}}if(!cnt)return null;const w=(H-L)/L*100;if(w<p.minPct||w>p.maxPct)return null;
  /* only the first close outside after the window */
  for(let j=i-1;j>=0&&k[j].t>=we;j--){if(k[j].c>H||k[j].c<L)return null;}
  if(b.c>H)return p.rev?'SHORT':'LONG';if(b.c<L)return p.rev?'LONG':'SHORT';return null;}};
/* 24. sami_algo-style liquidity radar (window.ind2.liqSignals) */
STR.LIQ={name:'رادار نقدینگی (سوییپ/انبساط + امتیاز)',nameEn:'Liquidity radar (sweep/expansion + score)',params:{min:P('حداقل امتیاز (۰–۶)',3,0,6,1,'Min score (0–6)'),ema:P('فیلتر EMA200 (۰/۱)',1,0,1,1,'EMA200 filter (0/1)'),cool:P('فاصلهٔ سیگنال‌ها',5,0,30,1,'Cooldown bars'),kind:P('نوع: ۰ هر دو / ۱ سوییپ / ۲ انبساط',0,0,2,1,'Kind: 0 both / 1 sweep / 2 expansion')},overlays:()=>[],
 sig:(p,i)=>{const k=K();if(!window.ind2)return null;if(CK!==k||!CC['__liq'+p.min+p.ema+p.cool]){indCalc('ATR');CC['__liq'+p.min+p.ema+p.cool]=window.ind2.liqSignals(k,{minScore:p.min,emaFilter:!!p.ema,cool:p.cool});}const r=CC['__liq'+p.min+p.ema+p.cool];const s=r.sig[i];if(!s)return null;if(p.kind===1&&r.kind[i]!=='sweep')return null;if(p.kind===2&&r.kind[i]!=='exp')return null;return s>0?'LONG':'SHORT';}};
/* 25. Setup scorecard N/16 */
const SC_FA=['قیمت>EMA200','EMA50>EMA200','شیب EMA50','RSI>50','RSI صعودی','هیستوگرام MACD>0','هیستوگرام رو به بالا','ADX>20','+DI>−DI','قیمت>SMA20','حجم>میانگین','کلوز در نیمهٔ بالای کندل','کلوز>سقف قبلی','سقف ۲۰ بالاتر از ۲۰ کندل قبل','ATR نه افراطی','%B<1.05'];
STR.SCORE={name:'کارت امتیاز ستاپ (N/16)',nameEn:'Setup scorecard (N/16)',params:{min:P('حداقل امتیاز',12,6,16,1,'Min score'),trend:P('EMA روند',200,50,400,10,'Trend EMA')},overlays:p=>[['ema',[p.trend]]],
 score:(p,i,LG)=>{const k=K();const c=I('close'),E2=I('ema',p.trend),E5=I('ema',50),R=I('rsi',14),M=I('macd'),D=I('adx',14),S=I('sma',20),V=I('vol'),VS=I('volsma',20),A=I('atr',14),A5=I('sma',50)/*placeholder*/,BB=I('bb',20,2),DN=I('don',20);if(E2[i]==null||R[i-1]==null||D.adx[i]==null||BB.up[i]==null||DN.hh[i-20]==null)return -1;
  const sgn=LG?1:-1;const b=k[i];const pb=(b.c-BB.lo[i])/((BB.up[i]-BB.lo[i])||1);const atrRatio=A[i]/(A.slice(Math.max(0,i-50),i).reduce((s,x)=>s+(x||0),0)/50||A[i]);
  const T=[sgn*(b.c-E2[i])>0,sgn*(E5[i]-E2[i])>0,sgn*(E5[i]-E5[i-3])>0,sgn*(R[i]-50)>0,sgn*(R[i]-R[i-1])>0,sgn*M.h[i]>0,sgn*(M.h[i]-M.h[i-1])>0,D.adx[i]>20,sgn*(D.pdi[i]-D.ndi[i])>0,sgn*(b.c-S[i])>0,V[i]>VS[i],LG?(b.c-b.l)/((b.h-b.l)||1)>=0.5:(b.h-b.c)/((b.h-b.l)||1)>=0.5,LG?b.c>k[i-1].h:b.c<k[i-1].l,LG?DN.hh[i]>DN.hh[i-20]:DN.ll[i]<DN.ll[i-20],atrRatio<2,LG?pb<1.05:pb>-0.05];
  return T.filter(Boolean).length;},
 sig:function(p,i){const sL=this.score(p,i,true);if(sL<0)return null;const sS=this.score(p,i,false);const pL=this.score(p,i-1,true),pS=this.score(p,i-1,false);if(sL>=p.min&&pL<p.min&&sL>sS)return 'LONG';if(sS>=p.min&&pS<p.min&&sS>sL)return 'SHORT';return null;}};
/* marker-based strategies (indicator must be causal: these are) */
STR.REG5={name:'رژیم ۵حالته · بازگشت تیز در پولبک',nameEn:'Regime-5 · sharp reversal in pullback',params:{},overlays:p=>[['ema',[50]]],sig:markerSig('REG5',m=>m.text==='Buy'?'LONG':m.text==='Sell'?'SHORT':null)};
STR.TEC={name:'ورود ترکیبی (MACD+EMA+BB)',nameEn:'Trend-entry composite (MACD+EMA+BB)',params:{trend:P('فیلتر EMA (۰=خاموش)',200,0,400,10,'Trend EMA (0=off)')},overlays:p=>p.trend?[['ema',[p.trend]]]:[],sig:(p,i)=>{const s=markerSig('TEC',m=>m.text==='ENTRY'?(m.side==='up'?'LONG':'SHORT'):null)(p,i);if(!s||!p.trend)return s;const E=I('ema',p.trend);if(E[i]==null)return null;const c=K()[i].c;return (s==='LONG'&&c>E[i])||(s==='SHORT'&&c<E[i])?s:null;}};
STR.CONF={name:'نوسانگر هم‌گرایی ▲▼',nameEn:'Confluence oscillator ▲▼',params:{trend:P('فیلتر EMA (۰=خاموش)',0,0,400,10,'Trend EMA (0=off)')},overlays:p=>p.trend?[['ema',[p.trend]]]:[],sig:(p,i)=>{const s=markerSig('CONF',m=>m.text==='▲'?'LONG':m.text==='▼'?'SHORT':null)(p,i);if(!s||!p.trend)return s;const E=I('ema',p.trend);if(E[i]==null)return null;const c=K()[i].c;return (s==='LONG'&&c>E[i])||(s==='SHORT'&&c<E[i])?s:null;}};
STR.SQZB={name:'شکست باکس فشردگی (با تفکیک حجم)',nameEn:'Squeeze-box break (volume split)',params:{},overlays:p=>[['bb',[20,2]]],sig:markerSig('SQZB',m=>m.text==='Break'?(m.side==='up'?'LONG':'SHORT'):null)};
STR.NR7={name:'شکست کندل NR7',nameEn:'NR7 breakout',params:{trend:P('فیلتر EMA (۰=خاموش)',0,0,400,10,'Trend EMA (0=off)')},overlays:p=>p.trend?[['ema',[p.trend]]]:[],
 sig:(p,i)=>{const M=indCalc('NR').mk[i-1];if(!M||!M.some(m=>m.text==='NR7'))return null;const k=K(),b=k[i],n=k[i-1];const T=p.trend?I('ema',p.trend):null;if(T&&T[i]==null)return null;if(b.c>n.h&&(!T||b.c>T[i]))return 'LONG';if(b.c<n.l&&(!T||b.c<T[i]))return 'SHORT';return null;}};
STR.LVLPB={name:'STP-PB: شکست سطح + ری‌تست',nameEn:'STP-PB: level break + retest',params:{},overlays:()=>[],sig:markerSig('LVL',m=>m.text==='PB'?(m.side==='up'?'LONG':'SHORT'):null)};
STR.SWEEP={name:'سوییپ سطح نقدینگی (ضدروند)',nameEn:'Liquidity-level sweep (fade)',params:{trend:P('فقط هم‌جهت EMA (۰=خاموش)',0,0,400,10,'Only with EMA (0=off)')},overlays:p=>p.trend?[['ema',[p.trend]]]:[],sig:(p,i)=>{const s=markerSig('LVL',m=>m.text==='sweep'?(m.side==='dn'?'SHORT':'LONG'):null)(p,i);if(!s||!p.trend)return s;const E=I('ema',p.trend);if(E[i]==null)return null;const c=K()[i].c;return (s==='LONG'&&c>E[i])||(s==='SHORT'&&c<E[i])?s:null;}};
STR.MAX={name:'کراس SMA 10/30',nameEn:'SMA 10/30 cross',params:{f:P('سریع',10,3,50,1,'Fast'),s:P('کند',30,10,200,5,'Slow')},overlays:p=>[['sma',[p.f]],['sma',[p.s]]],sig:(p,i)=>{const a=I('sma',p.f),b=I('sma',p.s);if(a[i-1]==null||b[i-1]==null)return null;if(a[i]>b[i]&&a[i-1]<=b[i-1])return 'LONG';if(a[i]<b[i]&&a[i-1]>=b[i-1])return 'SHORT';return null;}};
STR.VCP={name:'شکست VCP (مینروینی)',nameEn:'VCP breakout (Minervini)',params:{},overlays:()=>[],sig:markerSig('VCP',m=>m.text==='VCP BO'?'LONG':null)};
/* 24. TEP (v126 research): trend engulfing pullback · stop-and-reverse. Regime = close vs EMA200 + EMA50 slope (10 bars); trigger = engulfing candle at EMA20 touch; hold until opposite signal (use Flip + Max hold ≈300, stop 2×ATR). Research: 10-symbol 4H basket, walk-forward positive; NOT robust on 1H. */
STR.TEP={name:'پولبک انگالف روندی (ورود و برگشت)',nameEn:'Trend engulf pullback (stop-and-reverse)',params:{trend:P('EMA روند',200,100,400,10,'Trend EMA'),slope:P('شیب EMA50 (کندل، ۰=خاموش)',10,0,30,1,'EMA50 slope bars (0=off)'),ma:P('EMA پولبک',20,10,50,1,'Pullback EMA'),adx:P('حداقل ADX (۰=خاموش)',0,0,40,1,'Min ADX (0=off)')},overlays:p=>[['ema',[p.ma]],['ema',[50]],['ema',[p.trend]]],
 sig:(p,i)=>{const k=K();if(i<p.trend+12)return null;const E=I('ema',p.trend),E5=I('ema',50),M=I('ema',p.ma);if(E[i]==null||M[i-1]==null)return null;const b=k[i],q=k[i-1];
  const ok=sg=>{if(sg*(b.c-E[i])<=0)return false;if(p.slope&&sg*(E5[i]-E5[i-p.slope])<=0)return false;if(p.adx){const D=I('adx',14);if(D.adx[i]==null||D.adx[i]<p.adx)return false;}
   const near=sg>0?(b.l<=M[i]*1.002||q.l<=M[i-1]*1.002):(b.h>=M[i]*0.998||q.h>=M[i-1]*0.998);if(!near)return false;
   return sg>0?(b.c>b.o&&q.c<q.o&&b.c>q.o&&b.o<=q.c):(b.c<b.o&&q.c>q.o&&b.c<q.o&&b.o>=q.c);};
  if(ok(1))return 'LONG';if(ok(-1))return 'SHORT';return null;}};
/* 25. VAB (v126 research): value-area acceptance breakout. Rolling volume profile of W bars (40 bins, volume spread over each bar's H–L); value area = 70% around POC.
   Signal: previous close inside value, this close outside (above VAH → LONG / below VAL → SHORT) with volume >1.2× avg, same side of EMA200. Exit: SL 1.5×ATR + trail 3×ATR, max 160 bars (set in Exits).
   5y · 10 symbols · 4H: n1725, win 31%, avg +0.20R, PF 1.33, DD 27R, 8/10 symbols, every year 2022–26 positive; 45/45 grid configs positive; yearly WF OOS +0.14R. Monthly corr with TEP 0.41. */
let VPK=null,VPC={};function vprof(W,nb){const k=K();if(VPK!==k){VPK=k;VPC={};}const key=W+'|'+nb;if(VPC[key])return VPC[key];const n=k.length;const poc=new Array(n).fill(null),vah=new Array(n).fill(null),val=new Array(n).fill(null);
 for(let i=W;i<n;i++){let lo=Infinity,hi=-Infinity;for(let j=i-W;j<i;j++){if(k[j].l<lo)lo=k[j].l;if(k[j].h>hi)hi=k[j].h;}const bw=(hi-lo)/nb||1e-9;const bins=new Float64Array(nb);
  for(let j=i-W;j<i;j++){const b=k[j];const a=Math.max(0,Math.floor((b.l-lo)/bw)),z=Math.min(nb-1,Math.floor((b.h-lo)/bw));const per=(b.v||0)/(z-a+1);for(let q=a;q<=z;q++)bins[q]+=per;}
  let p=0;for(let q=1;q<nb;q++)if(bins[q]>bins[p])p=q;let tot=0;for(let q=0;q<nb;q++)tot+=bins[q];let acc=bins[p],u=p,d=p;while(acc<0.7*tot&&(u<nb-1||d>0)){const up=u<nb-1?bins[u+1]:-1,dn=d>0?bins[d-1]:-1;if(up>=dn){u++;acc+=up;}else{d--;acc+=dn;}}
  poc[i]=lo+(p+0.5)*bw;vah[i]=lo+(u+1)*bw;val[i]=lo+d*bw;}
 return VPC[key]={poc,vah,val};}
STR.VAB={name:'شکست ناحیه‌ی ارزش (پروفایل حجم + پذیرش)',nameEn:'Value-area acceptance breakout (volume profile)',params:{w:P('طول پروفایل (کندل)',120,40,300,10,'Profile window (bars)'),vol:P('حجم > ۱٫۲× میانگین (۰/۱)',1,0,1,1,'Volume >1.2× avg (0/1)'),trend:P('فیلتر EMA (۰=خاموش)',200,0,400,10,'Trend EMA (0=off)')},overlays:p=>p.trend?[['ema',[p.trend]]]:[],
 sig:(p,i)=>{const k=K();if(i<Math.max(p.w,p.trend||0)+2)return null;const V=vprof(p.w,40);if(V.vah[i]==null||V.vah[i-1]==null)return null;const b=k[i],q=k[i-1];
  const inside=q.c<=V.vah[i-1]&&q.c>=V.val[i-1];if(!inside)return null;if(p.vol){const VS=I('volsma',20);if(VS[i]==null||!(b.v>1.2*VS[i]))return null;}
  let E=null;if(p.trend){E=I('ema',p.trend);if(E[i]==null)return null;}
  if(b.c>V.vah[i]&&(!E||b.c>E[i]))return 'LONG';if(b.c<V.val[i]&&(!E||b.c<E[i]))return 'SHORT';return null;}};
STR.CUSTOM=CUSTOM;
window.scorecardLabels=SC_FA;
if(document.getElementById('bktBox'))try{B.render();}catch(e){}
})();
