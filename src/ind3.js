/* ==== ind3.js (v130): indicators that need the v130 engine features (per-bar candle colours `_barColors`, `fill` shapes).
   STPSR  — swing S/R (lookback 100) → green lines, "STP" when broken, "STP PB" on the retest of the broken level
   MAFILL — state-coloured central MA (EMA 21) + fill price↔MA + double ribbon (EMA 8/21 vs 34/55) green/red fill
   DIP    — "Dip Setup" composite: Ichimoku cloud + 2 Supertrends (10/2, 20/4) + stepped pivot levels + EMA 50/200
   STRONG — strong buy/sell labels (3-of-4 confluence) + ⚡ momentum markers (|close−open| > 1.5×ATR with volume)
   PLAN   — auto labels ENTRY / STOP / TARGET 1-3 from the last SCORE≥5 signal, risk (red) / reward (green) boxes, shaded active window
   ATRTS is upgraded in place (candle colouring + fill).   All maths are own implementations. ==== */
(function(){
const L=window.LWChart;if(!L||!L.IND)return;const IND=L.IND,M=L.math;const {emaA,smaA,rsiA,atrA,adxA,superA}=M;const X=window.ind2||{};const piv=X.piv,scoreSeries=X.scoreSeries;
const G='#26a69a',R='#ef5350',B='#2962ff',Y='#f59e0b',P='#a78bfa',C='#22d3ee',W='#94a3b8',O='#f97316';
const nul=n=>new Array(n).fill(null);const cl=k=>k.map(x=>x.c);const add=(id,d)=>{IND[id]=d;};const fa=()=>(localStorage.getItem('fc_lang')||'fa')==='fa';
const fx=v=>v>=1000?v.toFixed(1):v>=1?v.toFixed(3):v.toPrecision(4);

/* ---- ATRTS upgrade: colour candles by the trailing-stop side and fill between price and the stop ---- */
if(IND.ATRTS){const base=IND.ATRTS.calc;IND.ATRTS.calc=k=>{const r=base(k);const n=k.length;const bc=nul(n),stop=nul(n);for(let i=0;i<n;i++){if(r.up[i]!=null){bc[i]='#26a69a';stop[i]=r.up[i];}else if(r.dn[i]!=null){bc[i]='#ef5350';stop[i]=r.dn[i];}}
 return Object.assign(r,{_barColors:bc,_shapes:[{k:'fill',a:cl(k),b:stop,up:'rgba(38,166,154,.10)',dn:'rgba(239,83,80,.10)'}]});};IND.ATRTS.label='ATR Trailing Stop 14/3 (coloured candles + fill)';IND.ATRTS.fa='استاپ دنباله‌دار ATR (رنگ کندل + پرشدگی)';}

/* ---- STPSR ---- */
add('STPSR',{group:'smc',label:'Swing S/R 100 + STP / STP PB (break & pullback)',fa:'حمایت/مقاومت سوئینگی ۱۰۰ + برچسب STP (شکست) و STP PB (پولبک)',pane:'main',calc:k=>{const n=k.length;if(n<60||!piv)return {_shapes:[]};const a=atrA(k,14);const A=a[n-1]||1;const from=Math.max(0,n-100-10);const pv=piv(k,5,from);const lv=[];pv.forEach(p=>{if(lv.some(q=>q.t===p.t&&Math.abs(q.p-p.p)<=0.3*A))return;lv.push({t:p.t,p:p.p,i:p.i+5,brk:null,pb:null,side:0});});
 const sh=[],mk=[];lv.forEach(L0=>{for(let i=L0.i+1;i<n;i++){const b=k[i];if(L0.brk==null){if(L0.t==='H'&&b.c>L0.p+0.1*A){L0.brk=i;L0.side=1;}else if(L0.t==='L'&&b.c<L0.p-0.1*A){L0.brk=i;L0.side=-1;}}else if(L0.pb==null){if(L0.side>0&&b.l<=L0.p+0.2*A&&b.c>L0.p-0.2*A)L0.pb=i;else if(L0.side<0&&b.h>=L0.p-0.2*A&&b.c<L0.p+0.2*A)L0.pb=i;else if((L0.side>0&&b.c<L0.p-0.5*A)||(L0.side<0&&b.c>L0.p+0.5*A)){L0.fail=i;break;}}}
  const col=L0.brk==null?G:(L0.fail?'rgba(148,163,184,.5)':Y);sh.push({k:'hl',t1:k[L0.i].t,t2:L0.fail?k[L0.fail].t:null,p:L0.p,color:col,dash:L0.brk!=null,w:L0.brk==null?1:1.5,text:(L0.t==='H'?'R ':'S ')+fx(L0.p)+(L0.brk!=null?(L0.fail?' ✗':' STP'):''),tc:col});
  if(L0.brk!=null)mk.push({t:k[L0.brk].t,side:L0.side>0?'up':'dn',text:'STP',color:Y,shape:'square'});if(L0.pb!=null&&!L0.fail)mk.push({t:k[L0.pb].t,side:L0.side>0?'up':'dn',text:'STP PB',color:L0.side>0?G:R,shape:L0.side>0?'arrowUp':'arrowDown'});});
 return {_shapes:sh,_markers:mk.slice(-30)};},colors:{}});

/* ---- MAFILL ---- */
add('MAFILL',{group:'trend',label:'State-coloured MA 21 + price fill + double ribbon fill',fa:'میانگین مرکزی رنگ‌شونده + پرشدگی قیمت/MA + ریبون دوبل',pane:'main',calc:k=>{const c=cl(k),n=k.length,e8=emaA(c,8),e21=emaA(c,21),e34=emaA(c,34),e55=emaA(c,55);const ad=adxA(k,14);const cols=nul(n),bc=nul(n);
 for(let i=0;i<n;i++){if(e55[i]==null)continue;const up=e21[i]>e55[i]&&c[i]>e21[i],dn=e21[i]<e55[i]&&c[i]<e21[i];const strong=ad&&ad[i]!=null&&ad[i]>25;cols[i]=up?(strong?'rgba(38,166,154,.22)':'rgba(38,166,154,.10)'):dn?(strong?'rgba(239,83,80,.22)':'rgba(239,83,80,.10)'):'rgba(245,158,11,.10)';bc[i]=up?G:dn?R:Y;}
 const rib=e8.map((v,i)=>v==null||e55[i]==null?null:(e8[i]+e21[i])/2),rib2=e34.map((v,i)=>v==null||e55[i]==null?null:(e34[i]+e55[i])/2);
 return {e8,e21,e34,e55,_barColors:bc,_shapes:[{k:'fill',a:c,b:e21,cols},{k:'fill',a:rib,b:rib2,up:'rgba(38,166,154,.18)',dn:'rgba(239,83,80,.18)'}]};},colors:{e8:'rgba(38,166,154,.9)',e21:Y,e34:'rgba(239,83,80,.9)',e55:W},width:1});

/* ---- DIP composite preset ---- */
add('DIP',{group:'trend',label:'Dip Setup preset (Ichimoku + 2× Supertrend + pivots + EMA 50/200)',fa:'پریست Dip Setup (ایچیموکو + دو سوپرترند + پیوت‌های پله‌ای + EMA ۵۰/۲۰۰)',pane:'main',calc:k=>{const n=k.length,c=cl(k);const hl=(p,i)=>{let H=-Infinity,Lo=Infinity;for(let j=Math.max(0,i-p+1);j<=i;j++){H=Math.max(H,k[j].h);Lo=Math.min(Lo,k[j].l);}return (H+Lo)/2;};
 const ten=c.map((_,i)=>i<8?null:hl(9,i)),kij=c.map((_,i)=>i<25?null:hl(26,i));const spA=nul(n),spB=nul(n);for(let i=0;i<n;i++){const j=i-26;if(j>=25&&ten[j]!=null&&kij[j]!=null)spA[i]=(ten[j]+kij[j])/2;if(j>=51)spB[i]=hl(52,j);}
 const s1=superA(k,10,2),s2=superA(k,20,4);const st1=s1.st||s1.line||s1,st2=s2.st||s2.line||s2;
 const e50=emaA(c,50),e200=emaA(c,200);const sh=[{k:'fill',a:spA,b:spB,up:'rgba(38,166,154,.12)',dn:'rgba(239,83,80,.12)'}];
 /* stepped pivots: last 6 confirmed swing levels drawn as steps from their bar to now */
 if(piv){const pv=piv(k,10,Math.max(0,n-300)).slice(-6);pv.forEach(p=>sh.push({k:'hl',t1:k[p.i].t,t2:null,p:p.p,color:p.t==='H'?'rgba(239,83,80,.6)':'rgba(38,166,154,.6)',dash:true,text:(p.t==='H'?'PH ':'PL ')+fx(p.p)}));}
 const mk=[];for(let i=60;i<n;i++){const dipUp=st2[i]!=null&&c[i]>st2[i]&&k[i].l<=(ten[i]||Infinity)&&c[i]>(kij[i]||-Infinity)&&st1[i]!=null&&c[i-1]<st1[i-1]&&c[i]>st1[i];if(dipUp)mk.push({t:k[i].t,side:'up',text:'DIP',color:G,shape:'arrowUp'});}
 return {ten,kij,st1,st2,e50,e200,_shapes:sh,_markers:mk.slice(-20)};},colors:{ten:C,kij:P,st1:G,st2:O,e50:Y,e200:W},width:1});

/* ---- STRONG ---- */
add('STRONG',{group:'sig',label:'Strong Buy / Sell labels + ⚡ momentum',fa:'برچسب خرید/فروش قوی + مارکر ⚡ مومنتوم',pane:'main',calc:k=>{const n=k.length,c=cl(k),e20=emaA(c,20),e50=emaA(c,50),r=rsiA(c,14),a=atrA(k,14),vs=smaA(k.map(x=>x.v||0),20);const mk=[];
 for(let i=55;i<n;i++){const b=k[i],A=a[i];if(!A)continue;const body=b.c-b.o;const sc=(s)=>{let q=0;if(s>0?e20[i]>e50[i]:e20[i]<e50[i])q++;if(s>0?r[i]>55&&r[i-1]<=55:r[i]<45&&r[i-1]>=45)q++;if(s>0?b.c>e20[i]&&b.l<=e20[i]:b.c<e20[i]&&b.h>=e20[i])q++;if(vs[i]&&b.v>1.3*vs[i])q++;return q;};
  const up=sc(1),dn=sc(-1);const mom=Math.abs(body)>=1.5*A&&vs[i]&&b.v>1.5*vs[i];
  if(up>=3&&body>0)mk.push({t:b.t,side:'up',text:fa()?'خرید قوی':'STRONG BUY',color:G,shape:'arrowUp'});else if(dn>=3&&body<0)mk.push({t:b.t,side:'dn',text:fa()?'فروش قوی':'STRONG SELL',color:R,shape:'arrowDown'});
  if(mom)mk.push({t:b.t,side:body>0?'up':'dn',text:'⚡',color:body>0?B:O,shape:'circle'});}
 return {_markers:mk.slice(-40)};},colors:{}});

/* ---- PLAN ---- */
add('PLAN',{group:'sig',label:'Auto plan labels: ENTRY / STOP / TARGET 1-3 + risk/reward boxes',fa:'برچسب خودکار ورود/استاپ/هدف ۱-۳ + باکس ریسک (قرمز) و ریوارد (سبز)',pane:'main',calc:k=>{const n=k.length;if(!scoreSeries||!piv||n<230)return {_shapes:[]};const S=scoreSeries(k);let i=n-2;while(i>210&&!(S[i]&&S[i].sc>=5))i--;if(!(S[i]&&S[i].sc>=5))return {_shapes:[]};
 const s=S[i],b=k[i],A=s.A;const side=s.side;const pv=piv(k,5,Math.max(0,i-120)).filter(p=>p.i+5<=i);const sw=side>0?pv.filter(p=>p.t==='L').slice(-1)[0]:pv.filter(p=>p.t==='H').slice(-1)[0];
 const entry=b.c;let stop=sw?(side>0?sw.p-0.2*A:sw.p+0.2*A):(side>0?b.l-0.5*A:b.h+0.5*A);if(Math.abs(entry-stop)>3*A)stop=side>0?entry-1.5*A:entry+1.5*A;const Rr=Math.abs(entry-stop);const tp=[1.1,2,3].map(m=>entry+side*m*Rr);
 /* active window: from the signal bar until stop or TP3 is hit */let end=null,out=null;for(let j=i+1;j<n;j++){const x=k[j];if(side>0?x.l<=stop:x.h>=stop){end=j;out='STOP';break;}if(side>0?x.h>=tp[2]:x.l<=tp[2]){end=j;out='T3';break;}}
 const t1=b.t,t2=end==null?null:k[end].t;const sh=[];const lab=fa()?{e:'ورود',s:'استاپ',t:'هدف'}:{e:'ENTRY',s:'STOP',t:'TARGET'};
 sh.push({k:'vband',t1,t2,fill:side>0?'rgba(38,166,154,.05)':'rgba(239,83,80,.05)'});
 sh.push({k:'box',t1,t2,p1:entry,p2:stop,fill:'rgba(239,83,80,.16)',stroke:R});sh.push({k:'box',t1,t2,p1:entry,p2:tp[1],fill:'rgba(38,166,154,.14)',stroke:G});
 sh.push({k:'hl',t1,t2,p:entry,color:W,text:lab.e+' '+fx(entry),left:true});sh.push({k:'hl',t1,t2,p:stop,color:R,text:lab.s+' '+fx(stop)+' (−1R)',left:true});tp.forEach((p,q)=>sh.push({k:'hl',t1,t2,p,color:G,dash:q>0,text:lab.t+(q+1)+' '+fx(p)+' ('+[1.1,2,3][q]+'R)',left:true}));
 sh.push({k:'txt',t:b.t,p:side>0?b.l:b.h,text:(side>0?'AL ▲ ':'SAT ▼ ')+s.sc+'/6 '+s.why.join('+')+(out?' · '+out:(i===n-2?'':' · open')),color:side>0?G:R,above:side<0,bg:'rgba(0,0,0,.55)'});
 return {_shapes:sh};},colors:{}});
})();
