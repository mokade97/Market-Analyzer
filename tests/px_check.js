const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync('/home/user/futures-calculator/index.html','utf8');
const SY=['BTC','ETH','SOL','BNB'];const D4={},D1={};for(const s of SY){const k=JSON.parse(fs.readFileSync('/home/user/.tt/bt/deep/'+s+'-USDT-SWAP_4H.json'));D4[s+'USDT']=k.slice(-2400);
 // build 1D from 4H
 const d=[];for(let i=0;i+6<=k.length;i+=6){const w=k.slice(i,i+6);d.push({t:w[0].t,o:w[0].o,h:Math.max(...w.map(b=>b.h)),l:Math.min(...w.map(b=>b.l)),c:w[5].c,v:w.reduce((a,b)=>a+b.v,0)});}D1[s+'USDT']=d.slice(-500);}
const errs=[];
const d=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',beforeParse(w){w.fetch=async()=>({ok:false,status:500,json:async()=>({}),text:async()=>''});w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,k)=>k==='measureText'?()=>({width:1}):()=>0,set:()=>true});w.confirm=()=>true;
 w.addEventListener('error',e=>errs.push(e.message));}});
setTimeout(async()=>{const w=d.window;w.klinesAny=async(sym,tf,lim)=>{const src=tf==='1D'?D1[sym]:D4[sym];return src?src.slice(-lim):null;};
 const PX=w.paperX;// universe: override via cfg syms
 PX._test.setCfg({syms:SY.map(s=>s+'USDT'),cryptoTop:0,metals:[],backDays:120,tfs:['4H'],strats:['ICHI','TEP','VAB'],auto:false});
 const st=PX._test.fresh();st.universe={t:Date.now(),syms:SY.map(s=>s+'USDT').concat(Array(20).fill('ZZZUSDT').map((x,i)=>'Z'+i+'USDT'))};PX._test.setState(st);
 const t0=Date.now();try{await PX.run(true);}catch(e){console.log('RUN ERROR',e.message);}
 const S=PX.state();const by={};S.closed.forEach(r=>{const k=r.strategy;by[k]=by[k]||{n:0,pnl:0,rr:0,outs:{}};by[k].n++;by[k].pnl+=r.pnl;by[k].rr+=r.rr;by[k].outs[r.out]=(by[k].outs[r.out]||0)+1;});
 console.log('ms',Date.now()-t0,'balance',S.balance.toFixed(2),'open',S.positions.map(p=>p.sym+':'+p.strategy+':'+p.side).join(','),'closed',S.closed.length);
 for(const k in by)console.log(k,'n',by[k].n,'pnl',by[k].pnl.toFixed(2),'ΣR',by[k].rr.toFixed(2),JSON.stringify(by[k].outs));
 const skips={};(S.log||[]).filter(l=>l.ev==='SKIP'||l.k==='SKIP'||/SKIP/.test(JSON.stringify(l))).slice(0,400).forEach(l=>{const j=JSON.stringify(l);const m=j.match(/"why":"([^"]{0,30})/);const key=(l.strategy||(l.d&&l.d.strategy)||'?')+'|'+(m?m[1]:'?');skips[key]=(skips[key]||0)+1;});console.log('skips sample',JSON.stringify(skips).slice(0,600));
 console.log('ERRS',errs);process.exit(0);},1500);
