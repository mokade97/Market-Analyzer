/* Offline unit tests for the Market Analyzer engine. Run: cd tests && npm i && npm test  (no network needed) */
const {JSDOM}=require('jsdom');const fs=require('fs');const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let pass=0,fail=0;const ok=(name,cond,info='')=>{if(cond){pass++;console.log('  ✓',name);}else{fail++;console.log('  ✗',name,info);}};
// 1. every inline script parses
[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((m,i)=>{try{new Function(m[1]);ok('script block '+i+' parses',true);}catch(e){ok('script block '+i+' parses',false,e.message);}});
function synth(path,noise=0.2){const k=[];let t=0;let seed=42;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};path.forEach(([from,to,n])=>{for(let i=0;i<n;i++){const c=from+(to-from)*(i+1)/n;const o=from+(to-from)*i/n;const h=Math.max(o,c)+noise*rnd(),l=Math.min(o,c)-noise*rnd();k.push({t:t++,o,h,l,c,v:100});}});return k;}
const mk=(o,h,l,c)=>({t:0,o,h,l,c,v:1});
const d=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',beforeParse(w){w.fetch=async()=>({ok:false,status:500,json:async()=>({}),text:async()=>''});w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.confirm=()=>true;}});
const errs=[];d.window.addEventListener('error',e=>errs.push(e.message));
setTimeout(()=>{const w=d.window;const $=id=>w.document.getElementById(id);
  console.log('\nCalculator');
  const set=(id,v)=>{$(id).value=v;$(id).dispatchEvent(new w.Event('input',{bubbles:true}));};set('entry',60000);set('sl',58800);set('tp',63600);set('maxloss',50);
  const txt=w.document.getElementById('page-calc').textContent;ok('R:R 1:3 shown',/1:3/.test(txt),txt.slice(0,100));
  console.log('\nChart patterns');const cp=w.lens.chartPatterns;const A=1;
  const cases=[['DOUBLE_TOP',synth([[100,100,30],[100,120,20],[120,110,15],[110,120,15],[120,108,12]]),'BREAK_DOWN'],['HEAD_AND_SHOULDERS',synth([[100,100,30],[100,115,15],[115,108,10],[108,125,15],[125,108,10],[108,115,10],[115,107,8]]),'BREAK_DOWN'],['ASCENDING_TRIANGLE',synth([[100,100,30],[100,120,15],[120,105,10],[105,120,10],[120,110,10],[110,120,10],[120,114,8],[114,120,6]]),'FORMING'],['FALLING_WEDGE',synth([[100,100,30],[100,130,15],[130,118,10],[118,126,8],[126,115,8],[115,121,6],[121,113,6],[113,118,5]]),'FORMING'],['DOUBLE_BOTTOM',synth([[120,120,30],[120,100,20],[100,110,15],[110,100,15],[100,113,12]]),'BREAK_UP'],['ASCENDING_CHANNEL',synth([[100,100,30],[100,110,10],[110,104,8],[104,116,10],[116,110,8],[110,122,10],[122,116,8],[116,126,8]]),'FORMING']];
  for(const [nm,k,st] of cases){const r=cp(k,k.length-1,A);const p=r&&r.patterns.find(x=>x.name===nm);ok(nm+' '+st,!!p&&p.status===st,JSON.stringify(r&&r.patterns.map(x=>x.name+':'+x.status)));}
  console.log('\nStructure / divergence / CHoCH');
  {const k=synth([[100,100,40],[100,120,8],[120,112,10],[112,123,25],[123,119,4]]);const S=w.lens.series(k,null);const r=w.lens.structureExtras(k,S,k.length-1,1);ok('regular bearish RSI divergence',r.divergences.some(x=>x.type==='REGULAR_BEARISH'&&x.indicator==='RSI'),JSON.stringify(r.divergences));}
  {const k=synth([[100,100,40],[100,110,10],[110,105,8],[105,116,10],[116,110,8],[110,122,10],[122,104,12]]);const S=w.lens.series(k,null);const r=w.lens.structureExtras(k,S,k.length-1,1);ok('uptrend + bearish CHoCH',r.swing_trend==='UPTREND_HH_HL'&&r.last_event&&r.last_event.type==='CHOCH_BEARISH',JSON.stringify(r.last_event));ok('fib of last leg present',!!(r.fib&&r.fib.levels[0.618]));}
  console.log('\nSweep + CHoCH + FVG');
  {const k=[];for(let i=0;i<30;i++)k.push(mk(120-i*0.5,120.5-i*0.5,119.5-i*0.5,119.6-i*0.5));k.push(mk(105,105.5,100,100.5),mk(100.5,103,100.2,102.5),mk(102.5,108,102,107.5),mk(107.5,108.2,104,104.5),mk(104.5,105,101,101.5),mk(101.5,102,98,101),mk(101,104,100.8,103.8),mk(103.8,107,103.5,106.8),mk(106.8,110,106.5,109.5),mk(109.5,110,108,108.5),mk(108.5,109,106,107.5),mk(107.5,108.5,105.5,108));for(let i=0;i<5;i++)k.push(mk(108+i,109+i,107.5+i,108.8+i));
   const Aa=new Array(k.length).fill(1);const r=w.lens.sweepSignals(k,Aa);ok('entry LONG at bar 41',r.sig[41]==='LONG',JSON.stringify(r.sig.map((s,i)=>s?i+s:null).filter(Boolean)));ok('live ENTRY_TRIGGERED expires after 3 bars (v108 entryI fix)',!(r.live&&r.live.status==='ENTRY_TRIGGERED'),JSON.stringify(r.live));{const r2=w.lens.sweepSignals(k.slice(0,44),Aa.slice(0,44));ok('live ENTRY_TRIGGERED 2 bars after entry, bars_ago=2',r2.live&&r2.live.status==='ENTRY_TRIGGERED'&&r2.live.bars_ago===2,JSON.stringify(r2.live));}ok('armed state before retest',w.lens.sweepSignals(k.slice(0,41),Aa).live.status==='ARMED_WAIT_FVG_RETEST');ok('swept state before CHoCH',w.lens.sweepSignals(k.slice(0,37),Aa).live.status==='SWEPT_WAIT_CHOCH');}
  console.log('\nSMC zones + packet');
  {const k=synth([[100,100,60],[100,130,10],[130,122,10],[122,140,10],[140,133,6]],0.3);const S=w.lens.series(k,null);const L=k.length-1;const z=w.lens.smcZones(k,L,S.atr[L]||1);ok('smcZones returns counts',!!(z&&z.counts),JSON.stringify(z&&z.counts));
   const big=synth([[100,100,120],[100,130,30],[130,122,20],[122,140,20],[140,133,10]],0.3).map((b,i)=>Object.assign(b,{t:1700000000000+i*144e5}));const p=w.lens.packet('TEST','4H',big,null,'1D');ok('packet has new sections',!!(p&&p.smc_zones&&p.chart_patterns!==undefined&&p.structure_extras&&p.regime_quadrant),p&&Object.keys(p).join(','));}
  console.log('\nLedger');
  {const base=1700000000000;const okr=w.ledger.record({src:'test',sym:'ZZZUSDT',tf:'4H',side:'LONG',entry:100,stop:98,t1:103,t2:106,time:base,quad:'Q1'});ok('record',okr===true);ok('dedupe',w.ledger.record({src:'test',sym:'ZZZUSDT',tf:'4H',side:'LONG',entry:100,stop:98,t1:103,t2:106,time:base})===false);
   const st=w.ledger.stats([{rr:1},{rr:-1},{rr:2}]);ok('stats',st.n===3&&st.win===67&&st.pf===3,JSON.stringify(st));}
  ok('no runtime errors',errs.filter(e=>!/createObjectURL/.test(e)).length===0,errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);},900);
