import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
export function run(folder,tag){
 const w=new Window({url:'http://localhost/'});
 const manifest=JSON.parse(readFileSync(new URL(`./${folder}/component.manifest.json`,import.meta.url),'utf8'));
 const code=readFileSync(new URL(`./${folder}/${manifest.bundle}`,import.meta.url),'utf8').replace('export class','class');
 w.eval(code);const e=w.document.createElement(tag);w.document.body.append(e);
 const labels={search:'Search',empty:'Empty',ai:'AI',you:'You',serious:'Serious',ironic:'Ironic',custom:'Custom',send:'Send',hint:'600 characters',busy:'Working',original:'Original',correction:'Correction',authors:'Authors'};
 e.i18n=labels;const root=e.shadowRoot;
 assert(root,'Open shadow root');assert.equal(manifest.backendCalls,false);
 assert(!code.includes('fetch('));assert(!code.includes('localStorage'));
 if(folder==='usecase-picker'){
  e.useCases=[{id:'x',name:'<img src=x onerror=alert(1)>',language:'de'},{id:'y',name:'Italian',language:'it'}];
  assert.equal(root.querySelectorAll('button').length,2);assert.equal(root.querySelector('img'),null);
  let received;e.addEventListener('sd:usecase-select',ev=>{received=ev;});root.querySelector('button').click();
  assert.equal(received.detail.useCaseId,'x');assert(received.bubbles&&received.composed);
  e.busy=true;received=null;root.querySelector('button').click();assert.equal(received,null);
  e.busy=false;const search=root.querySelector('input');search.value='italian';search.dispatchEvent(new w.Event('input'));assert.equal(root.querySelectorAll('button').length,1);
  search.value='no-match';search.dispatchEvent(new w.Event('input'));assert(root.textContent.includes('Empty'));
 }else if(folder==='story-reader'){
  const segments=[{id:'a',turnId:'n',text:'<script>secret</script>',kind:'opening',actorId:'ai'},{id:'b',turnId:'n2',text:'Continue',kind:'user-contribution',actorId:'solo'},{id:'c',turnId:'n2',text:'Bridge',kind:'ai-bridge',actorId:'ai'},{id:'d',turnId:'n3',text:'Player Two says hello',kind:'user-contribution',actorId:'player2'}];
  e.segments=segments;e.activeNodeId='n2';e.presentation='prose';e.actorLabels={solo:'Du (Solo)',player2:'Mitspielerin'};
  // Unified reading document: in prose mode, exactly 1 surface paragraph with inline spans, no article cards or repeated author headings
  assert.equal(root.querySelectorAll('article').length,0);
  assert.equal(root.querySelectorAll('.prose-surface').length,1);
  const segSpans=root.querySelectorAll('.segment');assert.equal(segSpans.length,4);
  assert.equal(root.querySelectorAll('.legend').length,1);
  assert.equal(root.querySelectorAll('.legend-item').length,3); // ai, solo, player2
  // Textsicherheit
  assert.equal(root.querySelectorAll('script').length,0);
  // Stabile Farben
  const soloBg=root.querySelector('[data-actor-id=solo]').style.backgroundColor;
  const p2Bg=root.querySelector('[data-actor-id=player2]').style.backgroundColor;
  assert.equal(soloBg,'#eceef0');
  assert.ok(p2Bg&&p2Bg!=='transparent'&&p2Bg!==soloBg);
  // Farbzuordnung nach Umsortierung unverändert
  e.segments=[...segments].reverse();
  assert.equal(root.querySelector('[data-actor-id=solo]').style.backgroundColor,soloBg);
  assert.equal(root.querySelector('[data-actor-id=player2]').style.backgroundColor,p2Bg);
  e.segments=segments;
  // Events via Keyboard (Enter) and Space and Click
  let selected;e.addEventListener('sd:segment-select',ev=>selected=ev);
  root.querySelector('[data-segment-id=a]').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter'}));
  assert.equal(selected.detail.segmentId,'a');assert(selected.composed&&selected.bubbles);
  selected=null;root.querySelector('[data-segment-id=b]').dispatchEvent(new w.KeyboardEvent('keydown',{key:' '}));
  assert.equal(selected.detail.segmentId,'b');
  // Presentation modes: language and learning group by turnId
  e.presentation='language';
  const langParagraphs=root.querySelectorAll('.turn-paragraph');
  assert.equal(langParagraphs.length,3); // turn n, turn n2, turn n3
  // turn n2 contains both user-contribution 'b' and ai-bridge 'c' in the same paragraph
  const n2Para=root.querySelector('[data-turn-id=n2]');
  assert.ok(n2Para);
  assert.equal(n2Para.querySelectorAll('.segment').length,2);
  e.presentation='learning';assert.equal(root.querySelectorAll('.mode-learning').length,3);
  e.presentation='invalid';assert.equal(root.querySelectorAll('.prose-surface').length,1);
  assert.equal(root.querySelector('.legend').getAttribute('role'),'group');
  assert.equal(root.querySelector('.legend').getAttribute('aria-label'),'Authors');
  assert.equal(root.querySelectorAll('.surface small').length,0);
  assert.equal(root.querySelector('[data-segment-id=b]').getAttribute('title'),'Du (Solo)');
  assert.equal(root.querySelector('[data-segment-id=b]').getAttribute('aria-label'),'Du (Solo): Continue');
  root.querySelector('[data-segment-id=d]').click();assert.equal(selected.detail.segmentId,'d');
  // Unveränderte Eingaben
  assert.deepEqual(segments.map(s=>s.text),['<script>secret</script>','Continue','Bridge','Player Two says hello']);
  // Leerer Zustand
  e.segments=[];assert(root.textContent.includes('Empty'));
 }else if(folder==='choice-panel'){
  const question={id:'q1',text:'Choose',options:[{id:'a',text:'First',tone:'serious'},{id:'b',text:'Second',tone:'serious'},{id:'c',text:'Funny',tone:'ironic'}]};
  e.question=question;e.allowCustom=true;let events=[];e.addEventListener('sd:answer-submit',ev=>events.push(ev));
  assert.equal(root.querySelectorAll('[data-option-id]').length,3);assert(root.querySelector('textarea'));
  const old=root.querySelector('button');old.click();old.click();assert.equal(events.length,1);assert.equal(events[0].detail.selectedOptionId,'a');assert(events[0].bubbles&&events[0].composed);assert([...root.querySelectorAll('button')].every(b=>b.disabled));
  e.busy=false;const input=root.querySelector('textarea');input.value='I has a plan';input.dispatchEvent(new w.Event('input'));root.querySelector('form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(events.length,2);assert.equal(events[1].detail.customAnswer,'I has a plan');
  e.busy=true;e.busy=false;assert.equal(root.querySelector('textarea').value,'I has a plan');
  e.disabled=true;assert.equal(root.querySelector('section').getAttribute('aria-busy'),'false');assert.equal(root.querySelector('[role=status]'),null);assert([...root.querySelectorAll('button')].every(b=>b.disabled));e.disabled=false;assert(![...root.querySelectorAll('button')].every(b=>b.disabled));
  e.question={...question,id:'q2'};assert.equal(root.querySelector('textarea').value,'');
  e.question={...question,options:[...question.options,question.options[0]]};assert.equal(root.querySelector('button'),null);
 }else{
  e.comment={kind:'correction',text:'<img src=x>'};e.context='I has';assert.equal(root.querySelector('img'),null);assert(root.querySelector('[role=status]'));assert(root.textContent.includes('I has'));
  let received;e.addEventListener('sd:comment-expand',ev=>received=ev);const details=root.querySelector('details');details.open=true;details.dispatchEvent(new w.Event('toggle'));assert(received?.bubbles&&received?.composed);
  e.comment=null;assert.equal(root.querySelector('aside'),null);
 }
 w.happyDOM.abort();
}
