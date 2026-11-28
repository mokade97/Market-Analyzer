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
  console.log('\nv125: indicator catalogue + strategies + help');
  {const IND=w.LWChart.IND;const ids=Object.keys(IND).filter(id=>IND[id].calc);ok('≥80 indicators registered',ids.length>=80,String(ids.length));
   const kb=synth([[100,100,120],[100,130,40],[130,118,30],[118,150,50],[150,140,20],[140,160,40]],0.6).map((b,i)=>Object.assign(b,{t:1700000000000+i*36e5,v:1000+((i*7919)%500)}));
   let bad=[];ids.forEach(id=>{try{const r=IND[id].calc(kb);const keys=Object.keys(r).filter(x=>x[0]!=='_');if(keys.some(x=>!Array.isArray(r[x])||r[x].length!==kb.length))bad.push(id+':len');if(keys.some(x=>r[x].some(v=>v!=null&&!isFinite(v))))bad.push(id+':NaN');}catch(e){bad.push(id+':'+e.message);}});ok('every indicator runs clean on synthetic data',bad.length===0,bad.join(','));
   ok('indHelp has text for every indicator',ids.every(id=>w.indHelp.data[id]),ids.filter(id=>!w.indHelp.data[id]).join(','));
   const B=w.btStudio;const SIDS=Object.keys(B.STR).filter(x=>x!=='CUSTOM');ok('≥20 strategies',SIDS.length>=20,String(SIDS.length));B.setData(kb,'TEST','1H');let sb=[];
   SIDS.forEach(id=>{const S=B.STR[id];const p={};Object.keys(S.params).forEach(q=>p[q]=S.params[q].def);try{const tr=B.runBacktest(id,p,{side:'BOTH',slMode:'atr',slAtr:1.5,swN:10,tp:2,t1:0,trail:0,maxBars:40,flip:0,fee:0.1,slip:0.03,fund:0.01,risk:1});if(!Array.isArray(tr))sb.push(id);}catch(e){sb.push(id+':'+e.message);}});ok('every strategy backtests without throwing',sb.length===0,sb.join(','));
   ok('LWChart v1.3 API exported',w.LWChart.version==='1.3'&&!!w.LWChart.math&&!!w.ind2&&typeof w.ind2.liqSignals==='function'); /* mount itself is covered by the Playwright smoke test (jsdom lacks matchMedia listeners) */
  console.log('\nv138 indicator params / settings');
  {const LW=w.LWChart;const ks=synth([[100,100,120],[100,130,80],[130,110,60]],0.3);
   ok('paramsOf defaults (RSI)',JSON.stringify(LW.paramsOf('RSI'))==='{"len":14,"ob":70,"os":30}',JSON.stringify(LW.paramsOf('RSI')));
   ok('paramsOf clamps & ignores junk',LW.paramsOf('BOLL',{BOLL:{params:{len:9999,mult:'x'}}}).len===500&&LW.paramsOf('BOLL',{BOLL:{params:{len:9999,mult:'x'}}}).mult===2);
   ok('labelOf follows params',LW.labelOf('EMA',{EMA:{params:{a:10,b:30,c:100}}})==='EMA 10/30/100'&&LW.labelOf('RSI',{RSI:{params:{len:9}}})==='RSI 9',LW.labelOf('EMA',{EMA:{params:{a:10,b:30,c:100}}}));
   const r14=LW.IND.RSI.calc(ks),r5=LW.IND.RSI.calc(ks,{len:5,ob:70,os:30});ok('calc(k) without P uses defaults',r14.r.filter(v=>v!=null).length===ks.length-14,String(r14.r.filter(v=>v!=null).length));
   ok('calc(k,P) honours length',r5.r.filter(v=>v!=null).length===ks.length-5&&Math.abs(r5.r[ks.length-1]-r14.r[ks.length-1])>1e-9);
   const e=LW.IND.EMA.calc(ks,{a:5,b:10,c:20});ok('EMA params change output',Math.abs(e.e200[ks.length-1]-LW.IND.EMA.calc(ks).e200[ks.length-1])>1e-9);
   ok('indCfg UI + chart-actions params exported',typeof w.indCfg.open==='function'&&typeof w.indCfg.layouts==='function'&&/params/.test(w.chartActions.promptAddendum()));
   ok('≥25 indicators declare params',Object.keys(LW.IND).filter(id=>LW.IND[id].params).length>=25);}
   ok('mscan has D27 presets + D28 indicators',w.mscan.PRESETS.some(p=>p.id==='nr7')&&w.mscan.PRESETS.some(p=>p.id==='c97')&&!!w.mscan.IND.stage&&!!w.mscan.IND.extSma50Atr);
   ok('journal grader + ind editor + indHelp exposed',!!w.journalTag&&!!w.indEditor&&!!w.indHelp.open);}
   /* v129 */
   ok('quant toolkit exposed (GARCH/FDR/Kelly)',!!w.quant&&typeof w.quant.fdrVariants==='function'&&typeof w.quant.kellyFromTrades==='function'&&typeof w.quant.garch11==='function');
   { const pe=w.quant.plantedEdgeTest?w.quant.plantedEdgeTest():null; ok('planted-edge test: FDR finds the planted edge & rejects noise',!pe||(pe.ok===true&&pe.approved.length===1&&pe.approved[0]==='planted'),JSON.stringify(pe)); }
   ok('ind2 SDZ/SCORE/LVLT + scoreSeries',typeof w.ind2.scoreSeries==='function'&&!!w.indHelp.data&&['SDZ','SCORE','LVLT'].every(k=>!!w.indHelp.data[k]));
   { const ks=[];let px=100;for(let i=0;i<400;i++){const o=px;px=px*(1+(Math.sin(i/9)*0.01)+((i*7919)%13-6)/2000);ks.push({t:i*3600e3,o,h:Math.max(o,px)*1.003,l:Math.min(o,px)*0.997,c:px,v:1000+i});} let sc=null,e=null;try{sc=w.ind2.scoreSeries(ks);}catch(x){e=x.message;} ok('scoreSeries runs on synthetic bars',!e&&sc!=null,e||''); }
   { let e=null;try{w.mscan.render();}catch(x){e=x.message;} ok('mscan universe floor + dashboard render',!e&&!!w.document.getElementById('msDash')&&!!w.document.getElementById('msMinDv'),e||'no msDash/msMinDv'); }
   ok('multi-chart card mounted on chart page',!!w.document.getElementById('mcCard'));
   ok('calculator kelly i18n present',/kellyK/.test(html));
   /* v130 */
   { let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647-0.5;};const ks=[];let px=100;for(let i=0;i<600;i++){const o=px;px=px*(1+rnd()*0.03);const h=Math.max(o,px)*(1+Math.abs(rnd())*0.01),l=Math.min(o,px)*(1-Math.abs(rnd())*0.01);ks.push({t:1.6e12+i*14400e3,o,h,l,c:px,v:1000+Math.abs(rnd())*3000});}
     const IND=w.LWChart.IND;const res={};let err=null;for(const id of ['STPSR','MAFILL','DIP','STRONG','PLAN','ATRTS']){try{res[id]=IND[id].calc(ks);}catch(e){err=id+': '+e.message;}}
     ok('v130 indicators run (STPSR/MAFILL/DIP/STRONG/PLAN/ATRTS)',!err,err||'');
     ok('STPSR emits STP / STP PB markers',!!res.STPSR&&(res.STPSR._markers||[]).some(m=>m.text==='STP')&&(res.STPSR._shapes||[]).length>0);
     ok('ATRTS/MAFILL provide _barColors + fill shapes',!!res.ATRTS&&res.ATRTS._barColors.filter(Boolean).length>500&&res.ATRTS._shapes[0].k==='fill'&&!!res.MAFILL&&res.MAFILL._shapes.length===2);
     ok('PLAN draws entry/stop/targets + risk/reward boxes',!!res.PLAN&&(res.PLAN._shapes||[]).filter(s=>s.k==='box').length>=2&&(res.PLAN._shapes||[]).filter(s=>s.k==='hl').length>=5);
     ok('indHelp has v130 entries',['STPSR','MAFILL','DIP','STRONG','PLAN'].every(k=>!!w.indHelp.data[k]));
     ok('SMC watcher toggle present',!!w.document.getElementById('awSmc')); }
   /* v131 */
   { let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647-0.5;};const ks=[];let px=100;for(let i=0;i<500;i++){const o=px;px=px*(1+rnd()*0.03);const h=Math.max(o,px)*(1+Math.abs(rnd())*0.01),l=Math.min(o,px)*(1-Math.abs(rnd())*0.01);ks.push({t:1.6e12+i*14400e3,o,h,l,c:px,v:1000+Math.abs(rnd())*3000});}
     const kinds=['swingH','swingL','fvg','ob','res','sup','stop','predict','trend'];const got={};let err=null;for(const k of kinds){try{const t=w.chartLab.makeTask(k,ks.slice(0,480),ks);got[k]=!!t&&typeof t.check==='function';}catch(e){err=k+': '+e.message;}}
     ok('chart lab: deterministic task generators',!err&&['swingH','swingL','res','sup','stop','predict','trend'].every(k=>got[k]),err||JSON.stringify(got));
     ok('chart lab: numeric chart description for the AI',/SYMBOL .* TF .*ATR14/.test(w.chartLab.describe(ks)));
     ok('chart tab: LWC source + loadLw',!!w.document.getElementById('srcLw')&&typeof w.loadLw==='function');
     ok('learn: chart exercises present + lab button',/type:'chart'/.test(html)&&typeof w.learnMd==='function'); }
   { const px=w.paperX;const st=px.state();const keep=JSON.parse(JSON.stringify(st));const T0=Date.UTC(2026,0,7,12);st.startBal=100;st.closed=[{pnl:-1,closedT:T0-3*36e5},{pnl:-1,closedT:T0-2*36e5},{pnl:-1,closedT:T0-1*36e5}];
     const b1=px._test.breaker(T0),b2=px._test.breaker(T0+30*36e5);st.closed=[{pnl:-4,closedT:T0-36e5}];const b3=px._test.breaker(T0);st.closed=[{pnl:1,closedT:T0-36e5}];const b4=px._test.breaker(T0);px._test.setState(keep);
     ok('paper: circuit breaker (streak 24h / daily loss / clear)',b1&&b1.kind==='streak'&&!b2&&b3&&b3.kind==='daily'&&!b4,JSON.stringify([b1&&b1.kind,!!b2,b3&&b3.kind,!!b4])); }
   ok('bot ui: execution audit + filter report helpers',typeof w.execAudit==='function'&&/filterReportHtml/.test(html));
   ok('review: journal tutor review module',!!w.tradeReview&&w.tradeReview._isRound(60000)&&!w.tradeReview._isRound(61234)&&w.tradeReview._qsym('btc')==='BTCUSDT'&&w.tradeReview._qsym('XAUUSD')==='XAUUSDT');
   { const J=[{id:777,ts:Date.now()-864e5,symbol:'BTC',dir:'LONG',entry:100,sl:95,tp:115,size:1,maxLoss:5,rr:3,status:'closed',pnl:10,rMult:2,closedAt:Date.now()}];w.localStorage.setItem('fc_journal',JSON.stringify(J));let rvErr='';try{const fb=w.document.querySelector('#jFilters button[data-f="closed"]');if(fb)fb.click();else w.renderJournal();}catch(e){rvErr=e.message;}try{w.tradeReview.hook();}catch(e){rvErr+=' hook:'+e.message;}ok('review: button injected on closed trades',!!w.document.querySelector('#jList .rvBtn'),rvErr+' rows='+w.document.querySelectorAll('#jList .jrow').length+' '+String((w.document.getElementById('jList')||{}).innerHTML).slice(0,120));w.localStorage.removeItem('fc_journal'); }
   { const E=w.learnExam;const m=w.LEARN_MODULES[0];const qs=E.build(m,42),qs2=E.build(m,42),qs3=E.build(m,43);ok('exam: deterministic build, shuffled options keep answer',qs.length>=4&&JSON.stringify(qs)===JSON.stringify(qs2)&&JSON.stringify(qs)!==JSON.stringify(qs3)&&qs.every(x=>x.opts[x.a]!=null));
     const svg=E.certSvg({name:'Test <User>',title:'T',sub:'S',score:'90%',date:'2026-01-01',id:'X'});ok('exam: certificate svg escapes + renders',/^<svg/.test(svg)&&svg.includes('&lt;User&gt;')&&!svg.includes('<User>')); }
   { const px=w.paperX;const st=px.state();const keep=JSON.parse(JSON.stringify(st));const mk=(f)=>{const k=[];let c=100;for(let i=0;i<40;i++){c*=1+f(i);k.push({t:1.7e12+i*864e5,o:c,h:c,l:c,c,v:1});}return k;};
     px._test.setDaily({AAAUSDT:{'1D':mk(i=>Math.sin(i)*0.02)},BBBUSDT:{'1D':mk(i=>Math.sin(i)*0.02+0.001)},CCCUSDT:{'1D':mk(i=>Math.cos(i*1.7)*0.02)}});st.positions=[{sym:'BBBUSDT',side:'LONG'},{sym:'CCCUSDT',side:'LONG'}];
     const c1=px._test.corrMult('AAAUSDT','LONG',1.7e12+45*864e5),c2=px._test.corrMult('AAAUSDT','SHORT',1.7e12+45*864e5);px._test.setState(keep);px._test.setDaily({});
     ok('paper: correlation → half risk only vs same-direction twin',c1.mult===0.5&&c1.with&&c1.with.length===1&&/BBB/.test(c1.with[0])&&c2.mult===1,JSON.stringify([c1,c2])); }
   { const d={v:1,lastRun:new Date().toISOString(),config:{symbols:['BTCUSDT'],timeframes:['4H'],account:100,riskPct:1},equityR:1.2,stats:{all:{n:3,win_rate:0.5,avg_r:0.1,profit_factor:1.2}},shadowStats:{all:{n:5},byVerdict:{},byConf:{},byAiDecision:{},byChase:{},byStrategy:{},byQuad:{}},judgeReport:null,filterReport:{generatedAt:'2026-01-01T00:00:00Z',minClusters:20,weekN:2,allN:5,week:{'ADX < 30':{all:{n:2},kept:{n:1,clusters:1,clAvg:0.5},dropped:{n:1,clusters:1,clAvg:-1},verdict:'inconclusive',why:'x'}},allTime:{}},live:{gate:'live.enabled=false',cfg:{enabled:false},events:[],errors:[],open:0},shadowIndep:null,reconcile:null,shadow:[],shadowClosed:[],positions:[{sym:'BTCUSDT',tf:'4H',side:'LONG',entry:100,stop:95,t1:105,t2:110,size:1,riskUSD:1,fillSlipPct:0.2,hourUtc:3,cls:'crypto',strategy:'VAB',openedAt:new Date().toISOString(),reasons:[]}],alerts:[],closed:[{sym:'ETHUSDT',tf:'4H',side:'SHORT',entry:100,stop:105,t1:95,t2:90,rr:1.5,out:'T2',fillSlipPct:0.1,hourUtc:14,cls:'crypto',strategy:'VAB',openedAt:new Date().toISOString(),closedAt:new Date().toISOString(),reasons:[]}],errors:[]};
     w.localStorage.setItem('fc_bot_url','https://x.test/bot.json');let be='';try{w.botUI._setData(d);}catch(e){be=e.message;}const h=(w.document.getElementById('btBox')||{}).innerHTML||'';
     ok('bot ui: renders real-shaped bot.json without exception (v132 cards)',!be&&!/render error/.test(h)&&/ممیزی اجرا|Execution audit/.test(h)&&/پل اجرای زنده|Live 1%/.test(h),be||h.slice(0,200));w.localStorage.removeItem('fc_bot_url'); }
  ok('no runtime errors',errs.filter(e=>!/createObjectURL/.test(e)).length===0,errs.join(' | '));
  console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);},900);
