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
 // v136 one contract: policy judge mirrors bot shadowWhy; ticket; account sync
 {const b6=JSON.parse(JSON.stringify(base));b6.config.account=100;b6.config.riskPct=3;w.botUI._setData(b6);w.localStorage.setItem('fc_bot_cache',JSON.stringify(Object.assign({},base,{coverage:Object.assign({},base.coverage,{maxExtAtr:2,sizing:{account:100,riskPct:3}}),config:Object.assign({},base.config,{symbols:['BTCUSDT','ETHUSDT'],account:100,riskPct:3})})));const P=w.botPolicy;
  ok('policy: ICHI 4H SHORT BTC → ACTIVE',P.judge({sym:'BTCUSDT',tf:'4H',cls:'crypto',strategy:'ICHI',side:'SHORT'}).state==='ACTIVE');
  ok('policy: ICHI 4H LONG → SHADOW (side)',P.judge({sym:'BTCUSDT',tf:'4H',cls:'crypto',strategy:'ICHI',side:'LONG'}).state==='SHADOW');
  ok('policy: LENS 4H SHORT → SHADOW (strategy)',/LENS/.test(P.judge({sym:'BTCUSDT',tf:'4H',cls:'crypto',strategy:'LENS',side:'SHORT'}).why));
  ok('policy: 1H → SHADOW (tf)',P.judge({sym:'BTCUSDT',tf:'1H',cls:'crypto',strategy:'ICHI',side:'SHORT'}).state==='SHADOW');
  ok('policy: symbol outside universe → OUT',P.judge({sym:'PEPEUSDT',tf:'4H',cls:'crypto',strategy:'ICHI',side:'SHORT'}).state==='OUT');
  ok('policy: 15m → OUT',P.judge({sym:'BTCUSDT',tf:'15m',cls:'crypto',strategy:'ICHI',side:'SHORT'}).state==='OUT');
  ok('policy: extended entry → SHADOW (chase)',/ATR/.test(P.judge({sym:'BTCUSDT',tf:'4H',cls:'crypto',strategy:'ICHI',side:'SHORT',ext:-2.5}).why));
  ok('cls heuristic',P.cls('BTCUSDT')==='crypto'&&P.cls('XAUUSD')==='metal'&&P.cls('EURUSD')==='forex');
  w.localStorage.setItem('fc_acct','1000');w.localStorage.setItem('fc_riskpct','1');const T=P.ticket({sym:'BTCUSDT',tf:'4H',strategy:'ICHI',side:'SHORT',entry:100,stop:102,t1:97,t2:94});
  ok('ticket: qty from app account (1000×1%/2 = 5)',T&&Math.abs(T.qty-5)<1e-9&&T.r1===1.5&&T.r2===3&&T.lev===0.5,T);
  ok('ticket text is exchange-ready',/Entry 100 · SL 102/.test(T.text)&&/Policy: ACTIVE/.test(T.text),T.text);
  const box2=w.document.getElementById('btBox');const tb=box2.querySelector('[data-bt-ticket]');tb.click();ok('signal row ticket button renders ticket',/🎫/.test(box2.querySelector('[data-ticket-box]').textContent));
  ok('account mismatch shows sync button',!!box2.querySelector('[data-bt-sync]'));box2.querySelector('[data-bt-sync]').click();
  ok('sync sets app account = bot (100 × 3%)',w.localStorage.getItem('fc_acct')==='100'&&w.localStorage.getItem('fc_riskpct')==='3');
  ok('after sync the yellow mismatch alert is gone',!w.document.getElementById('btBox').querySelector('[data-bt-sync]'));
  w.localStorage.setItem('fc_acct','1000');w.localStorage.setItem('fc_riskpct','1');}
 {const k=[];let c=100;for(let i=0;i<400;i++){c*=1+(Math.sin(i/9)*0.01-0.002);k.push({t:Date.now()-(400-i)*144e5,o:c,h:c*1.01,l:c*0.99,c,v:1000});}
  const html=w.botPolicy.cardHtml({packet:{event:'SHORT_SETUP'},k},'BTCUSDT','4H');ok('lens card: LENS SHORT detected and labelled watch-only',/LENS SHORT/.test(html)&&/فقط پایش ربات|watch-only/.test(html),html.slice(0,300));
  const html2=w.botPolicy.cardHtml({packet:{event:'CANDLE'},k},'BTCUSDT','1H');ok('lens card 1H: scope line + base pill SHADOW',/1H/.test(html2)&&/👁/.test(html2));}
 {const b7=JSON.parse(JSON.stringify(base));b7.signals[0].flow={funding:0.0002,lsRatio:2.9,oiChg1hPct:1.5,taker1h:0.44};b7.filterReport={week:{'orderflow: 5m flow aligned':{kept:{n:0,clusters:0},dropped:{n:0,clusters:0},verdict:'inconclusive',why:''},'flow: OI rising 1h':{kept:{n:3,clusters:2,clAvg:0.1},dropped:{n:2,clusters:1,clAvg:-0.2},verdict:'inconclusive',why:''}},allTime:{'orderflow: 5m flow aligned':{kept:{n:0,clusters:0},dropped:{n:0,clusters:0},verdict:'inconclusive',why:''},'flow: OI rising 1h':{kept:{n:3,clusters:2,clAvg:0.1},dropped:{n:2,clusters:1,clAvg:-0.2},verdict:'inconclusive',why:''}}};
  w.botUI._setData(b7);const tx=w.document.getElementById('btBox').textContent;ok('signal row shows REST flow snapshot',/L\/S 2\.9/.test(tx)&&/OI1h \+1\.5%/.test(tx));ok('empty orderflow rows hidden, flow rows shown',!/orderflow: 5m flow aligned/.test(tx)&&/flow: OI rising 1h/.test(tx)&&/پنهان شد|hidden/.test(tx));}
 ok('no runtime errors',errs.length===0,errs);console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);},1500);
