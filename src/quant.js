/* ==== quant.js (v129): statistics toolkit — own implementations of textbook formulas (MIT 18.S096 lecture topics).
   GARCH(1,1) Gaussian MLE (Nelder-Mead), GARCH volatility forecast + stop distance, Benjamini-Hochberg FDR,
   cluster-robust t-statistic, Kelly (binary + continuous) with fractional cap, planted-edge self-test.
   Pure functions; no DOM. Exposed as window.quant (browser) and module.exports (node). ==== */
(function(){
const mean=a=>a.reduce((s,v)=>s+v,0)/(a.length||1);
const variance=a=>{const m=mean(a);return a.reduce((s,v)=>s+(v-m)*(v-m),0)/Math.max(1,a.length-1);};
/* ---------- Nelder-Mead (derivative-free minimiser) ---------- */
function nelderMead(f,x0,{step=0.5,tol=1e-10,maxIter=2000}={}){const n=x0.length;let S=[x0.slice()];for(let i=0;i<n;i++){const x=x0.slice();x[i]+=step;S.push(x);}
  let F=S.map(f);for(let it=0;it<maxIter;it++){const idx=F.map((v,i)=>i).sort((a,b)=>F[a]-F[b]);S=idx.map(i=>S[i]);F=idx.map(i=>F[i]);
    if(Math.abs(F[n]-F[0])<tol&&it>20)break;const cen=new Array(n).fill(0);for(let i=0;i<n;i++)for(let j=0;j<n;j++)cen[j]+=S[i][j]/n;
    const refl=cen.map((c,j)=>c+(c-S[n][j]));const fr=f(refl);
    if(fr<F[0]){const exp=cen.map((c,j)=>c+2*(c-S[n][j]));const fe=f(exp);if(fe<fr){S[n]=exp;F[n]=fe;}else{S[n]=refl;F[n]=fr;}continue;}
    if(fr<F[n-1]){S[n]=refl;F[n]=fr;continue;}
    const con=cen.map((c,j)=>c+0.5*(S[n][j]-c));const fc=f(con);if(fc<F[n]){S[n]=con;F[n]=fc;continue;}
    for(let i=1;i<=n;i++){S[i]=S[i].map((v,j)=>S[0][j]+0.5*(v-S[0][j]));F[i]=f(S[i]);}}
  return {x:S[0],f:F[0]};}
/* ---------- GARCH(1,1): sigma²_t = omega + alpha·r²_{t-1} + beta·sigma²_{t-1} ---------- */
function garchFilter(x,omega,alpha,beta,s2init){const vs=new Array(x.length);let v=s2init;for(let i=0;i<x.length;i++){vs[i]=v;v=omega+alpha*x[i]*x[i]+beta*v;}return vs;}
function garch11(r){r=r.filter(v=>isFinite(v));if(r.length<60)return null;const m=mean(r);const x=r.map(v=>v-m);const s2=variance(x)||1e-12;
  const unpack=p=>{const a=1/(1+Math.exp(-p[0]));const w=1/(1+Math.exp(-p[1]));const persist=0.999*a;const alpha=persist*w;const beta=persist-alpha;const lr=s2*Math.exp(Math.max(-5,Math.min(5,p[2])));return [lr*(1-persist),alpha,beta];};
  const nll=p=>{const [o,a,b]=unpack(p);const vs=garchFilter(x,o,a,b,s2);let t=0;for(let i=0;i<x.length;i++){const v=vs[i];if(!(v>0))return 1e100;t+=Math.log(v)+x[i]*x[i]/v;}return 0.5*t;};
  let best=null;for(const st of [[2.5,-2,0],[3.5,-2.5,0.3],[1.5,-1,-0.3]]){let r1=nelderMead(nll,st,{step:0.5});r1=nelderMead(nll,r1.x,{step:0.1});if(!best||r1.f<best.f)best=r1;}
  const [omega,alpha,beta]=unpack(best.x);const vs=garchFilter(x,omega,alpha,beta,s2);const last=x[x.length-1];const next=omega+alpha*last*last+beta*vs[vs.length-1];const persist=alpha+beta;
  return {omega,alpha,beta,persist,longRunVar:persist<1?omega/(1-persist):s2,nextVar:next,sigmaNext:Math.sqrt(next),sigmaLR:Math.sqrt(persist<1?omega/(1-persist):s2),nll:best.f,n:x.length,vars:vs,mean:m};}
/* multi-step forecast: E[sigma²_{t+h}] = LR + persist^(h-1)·(sigma²_{t+1} − LR); returns sqrt of the h-step cumulative variance */
function garchForecast(g,h=1){if(!g)return null;const LR=g.longRunVar;let tot=0,v=g.nextVar;for(let i=0;i<h;i++){tot+=v;v=LR+g.persist*(v-LR);}return {sigmaH:Math.sqrt(tot),sigma1:Math.sqrt(g.nextVar),horizon:h};}
/* rolling per-bar GARCH sigma (in return units) — refit every `refit` bars on a trailing window to stay O(n) in practice */
function garchSigmaSeries(closes,{window=500,refit=50,minBars=120}={}){const n=closes.length;const out=new Array(n).fill(null);const lr=[0];for(let i=1;i<n;i++)lr.push(Math.log(closes[i]/closes[i-1]));
  let g=null,lastFit=-1e9,v=null;for(let i=minBars;i<n;i++){if(i-lastFit>=refit){const seg=lr.slice(Math.max(1,i-window+1),i+1);g=garch11(seg);lastFit=i;if(g){v=g.nextVar;}}
    if(!g){continue;}if(i!==lastFit){const x=lr[i]-g.mean;v=g.omega+g.alpha*x*x+g.beta*v;}out[i]=Math.sqrt(Math.max(v,1e-16));}
  return out;}
/* stop distance (price units) = k · sigma_h · price, where sigma_h is the h-bar GARCH vol in return units */
function garchStop(price,sigma1,{k=1.5,horizon=1,persist=0.95,longRunVar=null}={}){if(sigma1==null)return null;let tot=0,v=sigma1*sigma1;const LR=longRunVar==null?v:longRunVar;for(let i=0;i<horizon;i++){tot+=v;v=LR+persist*(v-LR);}return k*Math.sqrt(tot)*price;}
/* ---------- statistics ---------- */
function tStat(a){const n=a.length;if(n<3)return {t:0,n,mean:0,se:0};const m=mean(a);const se=Math.sqrt(variance(a)/n)||1e-12;return {t:m/se,n,mean:m,se};}
/* cluster-robust mean t: observations with the same cluster key move together (e.g. same week) */
function clusteredT(vals,keys){const n=vals.length;if(n<3)return {t:0,n,clusters:0,mean:0};const m=mean(vals);const by={};for(let i=0;i<n;i++){const k=keys[i];by[k]=(by[k]||0)+(vals[i]-m);}const G=Object.keys(by).length;if(G<2)return {t:0,n,clusters:G,mean:m};
  let s=0;for(const k in by)s+=by[k]*by[k];const se=Math.sqrt(s*(G/(G-1)))/n;return {t:se?m/se:0,n,clusters:G,mean:m,se};}
/* two-sided normal p-value from t (fine for n≳30) */
function pFromT(t){const z=Math.abs(t);const p=0.5*erfc(z/Math.SQRT2);return Math.min(1,2*p);}
function erfc(x){const z=Math.abs(x);const t=1/(1+0.5*z);const r=t*Math.exp(-z*z-1.26551223+t*(1.00002368+t*(0.37409196+t*(0.09678418+t*(-0.18628806+t*(0.27886807+t*(-1.13520398+t*(1.48851587+t*(-0.82215223+t*0.17087277)))))))));return x>=0?r:2-r;}
/* Benjamini-Hochberg: indices whose p-values pass FDR q */
function bhSelect(pvals,q=0.1){const idx=pvals.map((p,i)=>[p,i]).sort((a,b)=>a[0]-b[0]);const m=pvals.length;let k=-1;for(let r=0;r<m;r++){if(idx[r][0]<=(r+1)/m*q)k=r;}const keep=new Set();for(let r=0;r<=k;r++)keep.add(idx[r][1]);return {keep:[...keep].sort((a,b)=>a-b),threshold:k>=0?(k+1)/m*q:0,tested:m};}
/* BH over an array of variant results [{id, rs:[...R], keys:[cluster keys]}] → adds t, p, approved */
function fdrVariants(variants,{q=0.1,minN=20}={}){const rows=variants.map(v=>{const n=(v.rs||[]).length;const ct=v.keys?clusteredT(v.rs,v.keys):tStat(v.rs||[]);const p=n>=minN?pFromT(ct.t):1;return {id:v.id,n,mean:ct.mean,t:ct.t,p,clusters:ct.clusters||n};});
  const bh=bhSelect(rows.map(r=>r.p),q);rows.forEach((r,i)=>{r.approved=bh.keep.includes(i)&&r.mean>0;});return {rows,q,threshold:bh.threshold,approved:rows.filter(r=>r.approved).map(r=>r.id)};}
/* ---------- Kelly ---------- */
const kellyBinary=(p,b)=>b<=0?0:p-(1-p)/b;                       /* win prob p, payoff b per 1 risked */
const kellyCont=(mu,sd)=>sd>0?mu/(sd*sd):0;                      /* continuous approx f* = μ/σ² (per-trade R units) */
function kellyFromTrades(rs,{fraction=0.5,cap=0.25}={}){const n=rs.length;if(n<10)return {n,fStar:0,fUse:0,note:'n<10'};const w=rs.filter(r=>r>0),l=rs.filter(r=>r<=0);const p=w.length/n;const aw=w.length?mean(w):0,al=l.length?Math.abs(mean(l)):1;const b=al?aw/al:0;const fb=kellyBinary(p,b);const fc=kellyCont(mean(rs),Math.sqrt(variance(rs)));const fStar=Math.max(0,Math.min(fb,fc));
  return {n,p,b,fBinary:fb,fCont:fc,fStar,fUse:Math.min(cap,fStar*fraction),fraction,cap};}
/* ---------- planted-edge self-test: the stats engine must approve a real edge and reject noise ---------- */
function plantedEdgeTest({n=400,edge=0.25,seed=7}={}){let s=seed;const rnd=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};const gauss=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
  const keys=Array.from({length:n},(_,i)=>Math.floor(i/5));const noise=Array.from({length:n},()=>gauss());const planted=noise.map(x=>x+edge);const fake=Array.from({length:8},(_,j)=>({id:'noise'+j,rs:Array.from({length:n},()=>gauss()),keys}));
  const res=fdrVariants([{id:'planted',rs:planted,keys},{id:'noise0',rs:noise,keys},...fake],{q:0.1});
  const ok=res.approved.includes('planted')&&res.approved.filter(x=>x!=='planted').length<=1;return {ok,approved:res.approved,rows:res.rows.map(r=>({id:r.id,t:+r.t.toFixed(2),p:+r.p.toFixed(4)}))};}
const api={nelderMead,garch11,garchForecast,garchSigmaSeries,garchStop,tStat,clusteredT,pFromT,bhSelect,fdrVariants,kellyBinary,kellyCont,kellyFromTrades,plantedEdgeTest};
if(typeof window!=='undefined')window.quant=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})();
