import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {StoryEngine} from '../server/story-engine';
process.env.NODE_ENV='test';
const {createApi}=await import('../server');
test('HTTP ownership, CSRF, strict inputs and zero-budget block before provider',async()=>{
 let calls=0;const engine=new StoryEngine(async()=>{calls++;throw new Error('must not call');});
 const server=createApi(undefined,engine).listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
 const address=server.address();assert(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}`;
 try{
  const config=await fetch(base+'/api/play-config');const cookie=config.headers.get('set-cookie')!.split(';')[0];assert(config.headers.get('set-cookie')!.includes('HttpOnly'));const c=await config.json();assert.equal(c.limits.callUsd,.01);assert(!JSON.stringify(c).includes('prompts'));
  const headers={'Content-Type':'application/json','x-sd-request':'1',cookie};
  assert.equal((await fetch(base+'/api/sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,403);
  assert.equal((await fetch(base+'/api/sessions',{method:'POST',headers:{...headers,'sec-fetch-site':'cross-site'},body:'{}'})).status,403);
  const blocked=await fetch(base+'/api/sessions',{method:'POST',headers,body:JSON.stringify({useCaseId:'fiction',locale:'de',limitUsd:0,idempotencyKey:randomUUID()})});assert.equal(blocked.status,402);assert.equal((await blocked.json()).error,'session_budget');assert.equal(calls,0);
  const huge=await fetch(base+'/api/sessions',{method:'POST',headers,body:JSON.stringify({data:'x'.repeat(8000)})});assert.equal(huge.status,413);
  const malformed=await fetch(base+'/api/sessions',{method:'POST',headers,body:'{oops'});assert.equal(malformed.status,400);assert.equal((await malformed.json()).error,'invalid_input');
  assert.equal((await fetch(base+'/api/sessions/missing',{headers})).status,404);
 }finally{await new Promise<void>(r=>server.close(()=>r()));}
});
