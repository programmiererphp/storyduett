import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {StoryEngine,StoryError,LIMITS,geminiProvider} from '../server/story-engine';
const fixture=(teacher=false)=>({opening:'The door opened.',contribution:'I opened a window.',bridge:'A breeze entered.',comment:{kind:teacher?'correction':'ironic',text:'A fresh idea.'},nextQuestion:{text:'Where next?',options:[{text:'Garden',tone:'serious'},{text:'Library',tone:'serious'},{text:'Ask the window',tone:'ironic'}]}});
const response=(raw:any=fixture())=>({modelVersion:'test-fixture',responseId:'synthetic',usageMetadata:{promptTokenCount:100,candidatesTokenCount:100,thoughtsTokenCount:2,totalTokenCount:202},candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(raw)}]}}]});
const start=()=>({useCaseId:'fiction',locale:'de',idempotencyKey:randomUUID()});
const turn=(s:any)=>({version:s.version,questionId:s.nodes.at(-1).nextQuestion.id,selectedOptionId:s.nodes.at(-1).nextQuestion.options[0].id,locale:'de',idempotencyKey:randomUUID()});
const make=(provider:any=async()=>response(),limits=LIMITS)=>{let now=Date.parse('2026-10-17T22:00:00Z');return {engine:new StoryEngine(provider,()=>now,{...limits}),tick:()=>now+=1000};};
test('ten append-only rounds, original free text, owner isolation and idempotency',async()=>{
 let calls=0;const {engine,tick}=make(async()=>{calls++;return response();});const initial=start();const [a,b]=await Promise.all([engine.start('owner',initial),engine.start('owner',initial)]);assert.equal(a.state.id,b.state.id);assert.equal(calls,1);
 let {state,token}=a;assert.throws(()=>engine.read(state.id,'other',token),/session_missing/);assert.throws(()=>engine.read(state.id,'owner','wrong'),/session_missing/);
 for(let i=0;i<10;i++){tick();const old=structuredClone(state.nodes);const input=turn(state);if(i===3){delete (input as any).selectedOptionId;(input as any).customAnswer='My unchanged raw answer';}
  const [next,retry]=await Promise.all([engine.turn(state.id,'owner',token,input),engine.turn(state.id,'owner',token,input)]);assert.deepEqual(next,retry);assert.deepEqual(next.nodes.slice(0,old.length),old);assert.equal(next.version,i+1);assert.equal(next.nodes.at(-1)!.nextQuestion.options.filter(o=>o.tone==='ironic').length,1);if(i===3)assert.equal(next.nodes.at(-1)!.rawAnswer,'My unchanged raw answer');
  state=next;assert.deepEqual(await engine.turn(state.id,'owner',token,input),state);
 }
 assert.equal(calls,11);assert.equal(state.usage.length,11);assert(state.spentUsd>0&&state.spentUsd<state.limitUsd);
 const stale=turn(a.state);await assert.rejects(engine.turn(state.id,'owner',token,stale),/stale_turn/);assert.equal(calls,11);
});
test('invalid JSON/shape, missing answer, timeout and429 preserve story but account unknown cost',async()=>{
 for(const failure of ['json','tone','missing','timeout','429']){
  let calls=0;const {engine,tick}=make(async()=>{if(++calls===1)return response();if(failure==='timeout')throw new StoryError('timeout',504);if(failure==='429')throw new StoryError('rate_limited',429);if(failure==='missing')return {};if(failure==='json')return {usageMetadata:{promptTokenCount:100,candidatesTokenCount:30},candidates:[{finishReason:'STOP',content:{parts:[{text:'{broken'}]}}]};const raw=fixture();raw.nextQuestion.options[2].tone='serious';return response(raw);});
  const {state,token}=await engine.start('owner',start());tick();const input=turn(state);await assert.rejects(engine.turn(state.id,'owner',token,input));const after=engine.read(state.id,'owner',token);assert.deepEqual(after.nodes,state.nodes);assert.deepEqual(after.segments,state.segments);assert.equal(after.version,0);assert.equal(after.usage.at(-1)!.status,'error');assert(after.spentUsd>state.spentUsd);await assert.rejects(engine.turn(state.id,'owner',token,input));assert.equal(calls,2);
 }
});
test('pre-call and session and daily reservations block provider calls; concurrent turn locks',async()=>{
 let calls=0;for(const changes of [{call:0.000001},{session:0},{userDay:0},{instanceDay:0},{input:1}]){const {engine}=make(async()=>{calls++;return response();},{...LIMITS,...changes});await assert.rejects(engine.start('owner',start()));}assert.equal(calls,0);
 let release:any;const gate=new Promise(r=>release=r);const {engine,tick}=make(async()=>{if(++calls===1)return response();await gate;return response();});const {state,token}=await engine.start('owner',start());tick();const pending=engine.turn(state.id,'owner',token,turn(state));await assert.rejects(engine.turn(state.id,'owner',token,turn(state)),/busy/);release();await pending;assert.equal(calls,2);
});
test('transport classifies provider failures without leaking bodies or keys',async()=>{
 for(const status of [429,403,500]){const provider=geminiProvider('private-fixture',async()=>new Response('private provider details',{status}) as any);await assert.rejects(provider({}),e=>e instanceof StoryError&&!e.message.includes('private'));}
 const provider=geminiProvider(undefined);if(!process.env.GEMINI_API_KEY)await assert.rejects(provider({}),/provider_unavailable/);
});

test('real transport abort signal stops a stalled provider request',async()=>{
 let aborted=false;const transport=((_url:any,options:any)=>new Promise((_resolve,reject)=>{options.signal.addEventListener('abort',()=>{aborted=true;reject(new Error('aborted'));});})) as typeof fetch;
 await assert.rejects(geminiProvider('synthetic',transport,10)({}),/timeout/);assert(aborted);
});
test('a partly used session blocks the next reservation without an extra provider call',async()=>{
 let calls=0;const {engine,tick}=make(async()=>{calls++;return response();});const initial=await engine.start('owner',{...start(),limitUsd:.006});let state=initial.state;const token=initial.token;
 let blocked=false;for(let i=0;i<20;i++){tick();try{state=await engine.turn(state.id,'owner',token,turn(state));}catch(e){assert.equal((e as StoryError).code,'session_budget');blocked=true;break;}}
 assert(blocked);const snapshot=engine.read(state.id,'owner',token);assert.deepEqual(snapshot.nodes,state.nodes);assert.equal(snapshot.usage.at(-1)!.chargedUsd,0);assert.equal(calls,snapshot.nodes.length);assert(snapshot.spentUsd<=.006);
});
test('instance budget reservation is atomic across owners; invalid-key errors are safe',async()=>{
 let release:any,calls=0;const gate=new Promise(r=>release=r);const {engine}=make(async()=>{calls++;await gate;return response();},{...LIMITS,instanceDay:.008});const first=engine.start('owner-a',start());await assert.rejects(engine.start('owner-b',start()),/daily_budget/);assert.equal(calls,1);release();await first;
 let attempts=0;const provider=geminiProvider('synthetic-key',(async()=>{attempts++;return new Response(JSON.stringify({error:{code:400,message:'API key not valid.',status:'INVALID_ARGUMENT'}}),{status:400,headers:{'Content-Type':'application/json'}});}) as typeof fetch);
 await assert.rejects(provider({}),e=>e instanceof StoryError&&e.code==='provider_unavailable');assert.equal(attempts,1);
});
