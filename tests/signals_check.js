/* v135: Signals card renders ACTIVE / SHADOW / REJECTED from bot.json v2; empty states; notification dedupe */
const {JSDOM}=require('jsdom');const fs=require('fs');const h=fs.readFileSync(__dirname+'/../index.html','utf8');const errs=[];
const d=new JSDOM(h,{runScripts:'dangerously',url:'http://localhost/',beforeParse(w){w.HTMLCanvasElement.prototype.getContext=()=>null;w.fetch=()=>Promise.reject(new Error('x'));w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});w.scrollTo=()=>{};w.WebSocket=undefined;w.addEventListener('error',e=>errs.push(e.message));}});
let pass=0,fail=0;const ok=(n,c,i)=>{c?pass++:fail++;console.log(c?'  ✓':'  ✗',n,c?'':JSON.stringify(i||'').slice(0,200));};
setTimeout(()=>{const w=d.window;w.localStorage.setItem('fc_bot_url','https://x/bot.json');const now=Date.now();const iso=t=>new Date(t).toISOString();
 const sig=(id,pol,pr,extraMin)=>({v:'sig/1',id,ts:iso(now-6e5),sym:id.split('|')[0],cls:'crypto',tf:'4H',side:id.split('|')[3],strategy:'ICHI',stratVer:'ICHI@v135',barClose:iso(now-36e5),expiresAt:iso(now+(extraMin==null?3*36e5:extraMin*6e4)),entry:100,entryZone:[99.25,100.75],stop:103,t1:95.5,t2:91,rr:3,invalidation:'close beyond 103',src:'okx',status:'x',why:['r1'],warns:[],setupValid:pol!=='REJECTED',publishPolicy:pol,paperResult:pr});
 const base={v:2,lastRun:iso(now-5*6e4),durationSec:30,dataSrc:'okx',config:{symbols:['BTCUSDT'],timeframes:['4H'],judge:'x'},equityR:1,equityUSD:3,stats:{all:{n:22,win:50,pf:1.2,maxDD:3,avg:0.1},byStrategy:{LENS:{n:22,win:50,avg:0.1}}},positions:[],alerts:[],closed:[],errors:[],
  funnel:{pairs:186,dataOk:180,dataFail:6,rawNoms:9,candidates:5,seenSkipped:3,cooldownSkipped:1,deepPicked:5,deepDataFail:1,retried:1,labRejected:1,rulesRejected:2,htfRejected:1,shadowOnly:1,published:1,activeNotOpened:1,paperOpened:0,timeSkipped:0},
  coverage:{classes:['crypto','metal','forex'],shadowClasses:['metal'],timeframes:['4H','1D'],shadowTimeframes:['1H'],paperStrategies:['ICHI'],liveSides:{ICHI:['SHORT']},aiMode:'shadow',paperTrade:true,realOrders:false},
  signals:[sig('BTCUSDT|4H|ICHI|SHORT|a','ACTIVE','CAP'),sig('ETHUSDT|4H|ICHI|SHORT|b','ACTIVE','OPENED',-30),sig('SOLUSDT|4H|ICHI|LONG|c','SHADOW','N_A'),sig('XRPUSDT|4H|ICHI|LONG|d','REJECTED','N_A')]};
 w.botUI._setData(JSON.parse(JSON.stringify(base)));const box=w.document.getElementById('btBox');const txt=box.textContent;
 ok('signals card rendered with funnel line',/186/.test(txt)&&/🎯/.test(txt),txt.slice(0,100));
 ok('active tab shows 1 live + 1 expired',/🎯 فعال 1\+1|active 1\+1/.test(box.querySelector('[data-sig-tab="active"]').textContent),box.querySelector('[data-sig-tab="active"]').textContent);
 ok('CAP-blocked ACTIVE row shows paper reason',/سقف پوزیشن|book full/.test(txt));
 ok('coverage shows metal as watch-only',/metal 👁/.test(txt));
 ok('paper record warns that 22 closed trades are not ICHI',/22 .*قبلی|22 closed/.test(txt));
 box.querySelector('[data-sig-tab="shadow"]').click();ok('shadow tab lists SOL',/SOLUSDT/.test(w.document.getElementById('btBox').textContent)&&!/XRPUSDT/.test(w.document.getElementById('btBox').textContent));
 w.document.getElementById('btBox').querySelector('[data-sig-tab="rejected"]').click();ok('rejected tab lists XRP',/XRPUSDT/.test(w.document.getElementById('btBox').textContent));
 w.document.getElementById('btBox').querySelector('[data-sig-tab="active"]').click();
 // empty states
 const e1=JSON.parse(JSON.stringify(base));e1.signals=[];w.botUI._setData(e1);ok('empty + fresh → "scanned, nothing valid"',/اسکن انجام شد|Scanned/.test(w.document.getElementById('btBox').textContent));
 const e2=JSON.parse(JSON.stringify(e1));e2.lastRun=iso(now-3*36e5);w.botUI._setData(e2);ok('empty + stale → stale warning',/قدیمی است|stale/.test(w.document.getElementById('btBox').textContent));
 const e3=JSON.parse(JSON.stringify(e1));e3.funnel.dataFail=120;e3.funnel.dataOk=60;w.botUI._setData(e3);ok('empty + data failures → incomplete warning',/نرسید|incomplete/.test(w.document.getElementById('btBox').textContent));
 const e4=JSON.parse(JSON.stringify(e1));delete e4.signals;w.botUI._setData(e4);ok('legacy bot.json (no signals[]) → update hint',/v135/.test(w.document.getElementById('btBox').textContent));
 ok('no runtime errors',errs.length===0,errs);console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);},1500);
