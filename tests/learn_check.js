const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync('../index.html','utf8');
const calls=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:()=>()=>({})});
  w.fetch=async(url,o)=>{calls.push({url,o});return {ok:true,json:async()=>({choices:[{message:{content:'SCORE: 8/10\n\nخوب.'}}],candidates:[{content:{parts:[{text:'SCORE: 7/10'}]}}],content:[{text:'OK'}],data:[{id:'m1'}],models:[{name:'models/g'}]})};};
  w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});w.scrollTo=()=>{};w.confirm=()=>true;
}});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
(async()=>{await new Promise(r=>setTimeout(r,1500));
const $=id=>d.getElementById(id);
$('learnBtn').click();console.log('page on:',$('page-learn').classList.contains('on'),'modules rendered:',$('learnRoot').querySelectorAll('[data-ln]').length);
$('learnRoot').querySelector('[data-ln="m1l1"]').click();console.log('lesson title:',$('learnRoot').querySelector('b').textContent.slice(0,40));
const q=$('learnRoot').querySelector('[data-q]');if(q){q.click();console.log('quiz out:',$('qOut0').textContent.slice(0,30));}
console.log('prog:',w.localStorage.getItem('fc_learn_prog'));
// settings: avalai
$('setBtn').click();[...$('tutProv').querySelectorAll('button')].find(b=>b.dataset.prov==='avalai').click();console.log('avalai base:',$('tutBase').value,'model:',$('tutModel').value);
$('tutKey').value='aa-test';$('saveTut').click();$('testTut').click();await new Promise(r=>setTimeout(r,200));console.log('test url:',calls.at(-1).url,'status:',$('tutStatus').textContent.slice(0,40));
// anthropic
[...$('tutProv').querySelectorAll('button')].find(b=>b.dataset.prov==='anthropic').click();$('saveTut').click();$('testTut').click();await new Promise(r=>setTimeout(r,200));console.log('anthropic url:',calls.at(-1).url,'hdr:',Object.keys(calls.at(-1).o.headers).join(','));
[...$('tutProv').querySelectorAll('button')].find(b=>b.dataset.prov==='gemini').click();$('saveTut').click();$('testTut').click();await new Promise(r=>setTimeout(r,200));console.log('gemini url:',calls.at(-1).url.replace(/key=.*/,'key=…'));
// grading flow
[...$('tutProv').querySelectorAll('button')].find(b=>b.dataset.prov==='openrouter').click();$('saveTut').click();
$('learnBtn').click();const ta=$('learnRoot').querySelector('textarea');if(ta){const i=ta.id.replace('aiIn','');ta.value='پاسخ آزمایشی';$('learnRoot').querySelector(`[data-grade="${i}"]`).click();await new Promise(r=>setTimeout(r,300));console.log('grade out:',$('aiOut'+i).textContent.slice(0,20),'| prog grade:',JSON.parse(w.localStorage.getItem('fc_learn_prog')).m1l1.grade);const body=JSON.parse(calls.at(-1).o.body);console.log('sys prompt has skill:',body.messages[0].content.includes('senior trading coach'),'lang fa:',body.messages[0].content.includes('Persian'));}
// chat
$('lnBack').click();$('lnChat').click();$('lnChatIn').value='سلام';$('lnSend').click();await new Promise(r=>setTimeout(r,300));console.log('chat msgs:',$('lnChatLog').children.length);
console.log('errors:',errs);process.exit(0);})();
