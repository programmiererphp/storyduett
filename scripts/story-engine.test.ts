import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {StoryEngine,StoryError,LIMITS,geminiProvider,parseKnownErrorInfoReason,KNOWN_ERROR_INFO_REASONS,resolveServerApiKey,usageLogLine,validateAndNormalizeItalianA1,isSingleItalianWord,type Usage} from '../server/story-engine';
const fixture=(teacher=false)=>({opening:'The door opened.',contribution:'I opened a window.',bridge:'A breeze entered.',comment:{kind:teacher?'correction':'ironic',text:'A fresh idea.'},nextQuestion:{text:'Where next?',options:[{text:'Garden',tone:'serious'},{text:'Library',tone:'serious'},{text:'Ask the window',tone:'ironic'}]}});
const response=(raw:any=fixture())=>({modelVersion:'test-fixture',responseId:'synthetic',usageMetadata:{promptTokenCount:100,candidatesTokenCount:100,thoughtsTokenCount:2,totalTokenCount:202},candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(raw)}]}}]});
const start=()=>({useCaseId:'fiction',locale:'de',idempotencyKey:randomUUID()});
test('usage logs omit absent error indicators, preserve actual failures and do not mutate the audit record',()=>{
 const success={status:'success',model:'synthetic',inputTokens:10,errorCode:null,errorInfoReason:null} as unknown as Usage;
 const before=structuredClone(success);const line=usageLogLine(success);const parsed=JSON.parse(line);
 assert.equal(parsed.event,'sd_api_usage');assert.equal(parsed.status,'success');assert.equal(parsed.inputTokens,10);assert(!('errorCode' in parsed));assert(!('errorInfoReason' in parsed));assert(line.endsWith('\n'));assert.deepEqual(success,before);
 for(const status of ['error','blocked']){const failed={...success,status,errorCode:'provider_unavailable',errorInfoReason:'API_KEY_INVALID'} as Usage;const record=JSON.parse(usageLogLine(failed));assert.equal(record.status,status);assert.equal(record.errorCode,'provider_unavailable');assert.equal(record.errorInfoReason,'API_KEY_INVALID');}
});
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
 const provider=geminiProvider(undefined);if(!resolveServerApiKey())await assert.rejects(provider({}),/provider_unavailable/);
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

test('parseKnownErrorInfoReason recognizes allowed Google ErrorInfo reasons and filters unallowed messages',async()=>{
 assert.equal(parseKnownErrorInfoReason({message:JSON.stringify({error:{code:400,message:'Key bad',details:[{'@type':'type.googleapis.com/google.rpc.ErrorInfo',reason:'API_KEY_INVALID'}]}})}),'API_KEY_INVALID');
 assert.equal(parseKnownErrorInfoReason({message:JSON.stringify({error:{code:400,message:'Android restriction',details:[{'@type':'type.googleapis.com/google.rpc.ErrorInfo',reason:'API_KEY_ANDROID_APP_BLOCKED'}]}})}),'API_KEY_ANDROID_APP_BLOCKED');
 assert.equal(parseKnownErrorInfoReason({message:JSON.stringify({error:{code:400,message:'Service blocked',details:[{'@type':'type.googleapis.com/google.rpc.ErrorInfo',reason:'API_KEY_SERVICE_BLOCKED'}]}})}),'API_KEY_SERVICE_BLOCKED');
 assert.equal(parseKnownErrorInfoReason({message:JSON.stringify({error:{code:400,message:'Referrer blocked',details:[{'@type':'type.googleapis.com/google.rpc.ErrorInfo',reason:'API_KEY_HTTP_REFERRER_BLOCKED'}]}})}),'API_KEY_HTTP_REFERRER_BLOCKED');
 // Free arbitrary text must NEVER be accepted as reason
 assert.equal(parseKnownErrorInfoReason({message:'arbitrary text leaking internal secret: 12345'}),null);
 assert.equal(parseKnownErrorInfoReason(new Error('Some unexpected internal error')),null);
 assert.equal(parseKnownErrorInfoReason(new Error('untrusted message mentions \"API_KEY_INVALID\"')),null);
 // Known reasons allowlist check
 for(const reason of ['API_KEY_INVALID','API_KEY_SERVICE_BLOCKED','API_KEY_ANDROID_APP_BLOCKED','API_KEY_HTTP_REFERRER_BLOCKED']){
  assert.ok((KNOWN_ERROR_INFO_REASONS as readonly string[]).includes(reason));
 }
});

test('geminiProvider attaches allowed errorInfoReason to StoryError on Google API error response',async()=>{
 const provider=geminiProvider('test-key',(async()=>new Response(JSON.stringify({
  error:{
   code:400,
   message:'API key not valid.',
   status:'INVALID_ARGUMENT',
   details:[{'@type':'type.googleapis.com/google.rpc.ErrorInfo',reason:'API_KEY_INVALID'}]
  }
 }),{status:400,headers:{'Content-Type':'application/json'}})) as typeof fetch);
 await assert.rejects(provider({}),e=>e instanceof StoryError&&e.code==='provider_unavailable'&&e.errorInfoReason==='API_KEY_INVALID');
});

test('resolveServerApiKey prioritizes SD_GEMINI_API_KEY and falls back on empty or whitespace values with synthetic inputs', () => {
 // 1. Prioritizes SD_GEMINI_API_KEY when both keys are defined
 assert.equal(
  resolveServerApiKey({
   SD_GEMINI_API_KEY: 'synthetic-sd-key-12345',
   GEMINI_API_KEY: 'synthetic-standard-key-67890'
  }),
  'synthetic-sd-key-12345'
 );

 // 2. Falls back to GEMINI_API_KEY when SD_GEMINI_API_KEY is empty string
 assert.equal(
  resolveServerApiKey({
   SD_GEMINI_API_KEY: '',
   GEMINI_API_KEY: 'synthetic-standard-key-67890'
  }),
  'synthetic-standard-key-67890'
 );

 // 3. Falls back to GEMINI_API_KEY when SD_GEMINI_API_KEY is whitespace
 assert.equal(
  resolveServerApiKey({
   SD_GEMINI_API_KEY: '   \t  \n ',
   GEMINI_API_KEY: 'synthetic-standard-key-67890'
  }),
  'synthetic-standard-key-67890'
 );

 // 4. Falls back to GEMINI_API_KEY when SD_GEMINI_API_KEY is undefined
 assert.equal(
  resolveServerApiKey({
   SD_GEMINI_API_KEY: undefined,
   GEMINI_API_KEY: 'synthetic-standard-key-67890'
  }),
  'synthetic-standard-key-67890'
 );

 // 5. Returns SD_GEMINI_API_KEY when GEMINI_API_KEY is absent
 assert.equal(
  resolveServerApiKey({
   SD_GEMINI_API_KEY: 'synthetic-sd-key-12345'
  }),
  'synthetic-sd-key-12345'
 );

 // 6. Returns undefined when both are empty, whitespace or absent
 assert.equal(
  resolveServerApiKey({
   SD_GEMINI_API_KEY: '',
   GEMINI_API_KEY: ''
  }),
  undefined
 );
 assert.equal(
  resolveServerApiKey({
   SD_GEMINI_API_KEY: '   ',
   GEMINI_API_KEY: '   '
  }),
  undefined
 );
 assert.equal(
  resolveServerApiKey({}),
  undefined
 );

 // 7. SD_AI_ENABLED=false acts as killswitch: returns undefined regardless of keys
 assert.equal(
  resolveServerApiKey({
   SD_AI_ENABLED: 'false',
   SD_GEMINI_API_KEY: 'synthetic-sd-key-12345',
   GEMINI_API_KEY: 'synthetic-standard-key-67890'
  }),
  undefined
 );
 assert.equal(
  resolveServerApiKey({
   SD_AI_ENABLED: 'False',
   SD_GEMINI_API_KEY: 'synthetic-sd-key-12345'
  }),
  undefined
 );
 assert.equal(
  resolveServerApiKey({
   SD_AI_ENABLED: '  false  ',
   GEMINI_API_KEY: 'synthetic-standard-key-67890'
  }),
  undefined
 );

 // 8. Default is enabled when SD_AI_ENABLED is undefined or 'true'
 assert.equal(
  resolveServerApiKey({
   SD_AI_ENABLED: 'true',
   SD_GEMINI_API_KEY: 'synthetic-sd-key-12345'
  }),
  'synthetic-sd-key-12345'
 );
 assert.equal(
  resolveServerApiKey({
   SD_AI_ENABLED: undefined,
   SD_GEMINI_API_KEY: 'synthetic-sd-key-12345'
  }),
  'synthetic-sd-key-12345'
 );
});

test('Italian A1: isSingleItalianWord accepts valid Italian words with attached punctuation and rejects whitespace/multi-word/pure-punctuation', () => {
  assert.equal(isSingleItalianWord('ciao'), true);
  assert.equal(isSingleItalianWord('è'), true);
  assert.equal(isSingleItalianWord('perché'), true);
  assert.equal(isSingleItalianWord('città'), true);
  assert.equal(isSingleItalianWord("L'ora"), true);
  assert.equal(isSingleItalianWord("d'accordo"), true);
  assert.equal(isSingleItalianWord('aperto!'), true);
  assert.equal(isSingleItalianWord('chiuso.'), true);
  assert.equal(isSingleItalianWord('«prego»'), true);
  assert.equal(isSingleItalianWord('10:00'), true);
  assert.equal(isSingleItalianWord('nord-est'), true);
  assert.equal(isSingleItalianWord('citta\u0300'), true);
  assert.equal(isSingleItalianWord('ciao,mondo'), false);
  assert.equal(isSingleItalianWord('guida.arriva'), false);

  // Must reject multi-word strings and whitespace
  assert.equal(isSingleItalianWord('ciao mondo'), false);
  assert.equal(isSingleItalianWord(' ciao'), false);
  assert.equal(isSingleItalianWord('ciao '), false);
  assert.equal(isSingleItalianWord('ciao\nmondo'), false);
  assert.equal(isSingleItalianWord('ciao\tmondo'), false);
  assert.equal(isSingleItalianWord(''), false);
  assert.equal(isSingleItalianWord('   '), false);
  assert.equal(isSingleItalianWord(null), false);
  assert.equal(isSingleItalianWord(undefined), false);
  assert.equal(isSingleItalianWord(123), false);

  // Pure punctuation without letters/digits must be rejected
  assert.equal(isSingleItalianWord('.'), false);
  assert.equal(isSingleItalianWord('...'), false);
  assert.equal(isSingleItalianWord('?!'), false);
});

test('Italian A1: validateAndNormalizeItalianA1 validates and normalizes valid start and turn responses', () => {
  const validStart = {
    opening: ['Il', 'museo', 'è', 'aperto.'],
    contribution: [],
    bridge: [],
    comment: { kind: 'neutral', text: '' },
    nextQuestion: {
      text: ['Cosa', 'fai', 'adesso?'],
      options: [
        { text: ['Entro', 'subito.'], tone: 'serious' },
        { text: ['Aspetto', 'fuori.'], tone: 'serious' },
        { text: ['Mangio', 'un', 'gelato.'], tone: 'ironic' }
      ]
    }
  };

  const normStart = validateAndNormalizeItalianA1(validStart, true);
  assert.equal(normStart.opening, 'Il museo è aperto.');
  assert.equal(normStart.contribution, '');
  assert.equal(normStart.bridge, '');
  assert.equal(normStart.nextQuestion.text, 'Cosa fai adesso?');
  assert.equal(normStart.nextQuestion.options.length, 3);
  assert.equal(normStart.nextQuestion.options[0].text, 'Entro subito.');
  assert.equal(normStart.nextQuestion.options[1].text, 'Aspetto fuori.');
  assert.equal(normStart.nextQuestion.options[2].text, 'Mangio un gelato.');

  const validTurn = {
    opening: [],
    contribution: [
      ['Entro', 'nel', 'museo.'],
      ['Guardo', 'un', 'bel', 'quadro.']
    ],
    bridge: ['La', 'guida', 'sorride.'],
    comment: {
      kind: 'correction',
      text: 'Sehr gut! Korrektur: "Entro subito." (Ich trete sofort ein, Aussprache: en-tro su-bi-to).'
    },
    nextQuestion: {
      text: ['Dove', 'vai', 'dopo?'],
      options: [
        { text: ['Al', 'bar.'], tone: 'serious' },
        { text: ['A', 'casa.'], tone: 'serious' },
        { text: ['Sulla', 'luna.'], tone: 'ironic' }
      ]
    }
  };

  const normTurn = validateAndNormalizeItalianA1(validTurn, false);
  assert.equal(normTurn.opening, '');
  assert.equal(normTurn.contribution, 'Entro nel museo. Guardo un bel quadro.');
  assert.equal(normTurn.bridge, 'La guida sorride.');
  assert.equal(normTurn.comment.kind, 'correction');
  assert.equal(normTurn.comment.text.includes('en-tro su-bi-to'), true);
  assert.equal(normTurn.nextQuestion.text, 'Dove vai dopo?');
  assert.equal(normTurn.nextQuestion.options.length, 3);
});

test('Italian A1: sentence tuples stay separate even if the provider omits punctuation',()=>{
 const raw={opening:[],contribution:[['Io','entro','nel','museo'],['La','guida','arriva','ora']],bridge:['Tutti','sono','molto','gentili'],comment:{kind:'correction',text:'Korrektur'},nextQuestion:{text:['Cosa','vedi?'],options:[{text:['Un','quadro.'],tone:'serious'},{text:['Una','statua.'],tone:'serious'},{text:['Un','drago.'],tone:'ironic'}]}};
 const normalized=validateAndNormalizeItalianA1(raw,false);
 assert.equal(normalized.contribution,'Io entro nel museo. La guida arriva ora.');
 assert.equal(normalized.bridge,'Tutti sono molto gentili.');
 assert.throws(()=>validateAndNormalizeItalianA1({...raw,contribution:[['Io','entro.','La','guida.']]},false),/invalid_response/);
 assert.throws(()=>validateAndNormalizeItalianA1({...raw,contribution:[['Io,entro','nel','museo']]},false),/invalid_response/);
});

test('Italian A1: strict error enforcement for multi-word items, word counts, empty contents and invalid shapes', () => {
  const baseStart = () => ({
    opening: ['Il', 'museo', 'è', 'aperto.'],
    contribution: [],
    bridge: [],
    comment: { kind: 'neutral', text: '' },
    nextQuestion: {
      text: ['Cosa', 'fai', 'adesso?'],
      options: [
        { text: ['Entro', 'subito.'], tone: 'serious' },
        { text: ['Aspetto', 'fuori.'], tone: 'serious' },
        { text: ['Mangio', 'un', 'gelato.'], tone: 'ironic' }
      ]
    }
  });

  const baseTurn = () => ({
    opening: [],
    contribution: [['Entro', 'nel', 'museo.']],
    bridge: [],
    comment: { kind: 'correction', text: 'Korrektur: Entro subito (Ich gehe hinein, en-tro).' },
    nextQuestion: {
      text: ['Dove', 'vai', 'dopo?'],
      options: [
        { text: ['Al', 'bar.'], tone: 'serious' },
        { text: ['A', 'casa.'], tone: 'serious' },
        { text: ['Sulla', 'luna.'], tone: 'ironic' }
      ]
    }
  });

  // 1. Multi-word item bypass attempt
  const multiWordStart = baseStart();
  multiWordStart.opening = ['Il', 'museo è', 'aperto.'];
  assert.throws(() => validateAndNormalizeItalianA1(multiWordStart, true), /invalid_response/);

  const multiWordTurn = baseTurn();
  multiWordTurn.contribution[0] = ['Entro', 'nel museo'];
  assert.throws(() => validateAndNormalizeItalianA1(multiWordTurn, false), /invalid_response/);

  // 2. Exceeding word limit in start opening (5 words)
  const tooManyWordsOpening = baseStart();
  tooManyWordsOpening.opening = ['Il', 'grande', 'museo', 'è', 'aperto.'];
  assert.throws(() => validateAndNormalizeItalianA1(tooManyWordsOpening, true), /invalid_response/);

  // 3. Exceeding word limit in a contribution sentence (5 words)
  const tooManyWordsSentence = baseTurn();
  tooManyWordsSentence.contribution = [['Vado', 'al', 'bar', 'molto', 'velocemente.']];
  assert.throws(() => validateAndNormalizeItalianA1(tooManyWordsSentence, false), /invalid_response/);

  // 4. Exceeding sentence count in contribution (> 3 sentences)
  const tooManySentences = baseTurn();
  tooManySentences.contribution = [
    ['Uno', 'due.'],
    ['Tre', 'quattro.'],
    ['Cinque', 'sei.'],
    ['Sette', 'otto.']
  ];
  assert.throws(() => validateAndNormalizeItalianA1(tooManySentences, false), /invalid_response/);

  // 5. Exceeding words in bridge (> 4 words)
  const tooManyBridgeWords = baseTurn();
  tooManyBridgeWords.bridge = ['La', 'guida', 'italiana', 'parla', 'bene.'];
  assert.throws(() => validateAndNormalizeItalianA1(tooManyBridgeWords, false), /invalid_response/);

  // 6. Exceeding words in nextQuestion text (> 4 words)
  const tooManyQuestionWords = baseStart();
  tooManyQuestionWords.nextQuestion.text = ['Che', 'cosa', 'fai', 'adesso', 'qui?'];
  assert.throws(() => validateAndNormalizeItalianA1(tooManyQuestionWords, true), /invalid_response/);

  // 7. Exceeding words in option text (> 4 words)
  const tooManyOptionWords = baseStart();
  tooManyOptionWords.nextQuestion.options[0].text = ['Entro', 'subito', 'nel', 'bel', 'museo.'];
  assert.throws(() => validateAndNormalizeItalianA1(tooManyOptionWords, true), /invalid_response/);

  // 8. Empty active opening on start
  const emptyOpeningStart = baseStart();
  emptyOpeningStart.opening = [];
  assert.throws(() => validateAndNormalizeItalianA1(emptyOpeningStart, true), /invalid_response/);

  // 9. Active opening present on turn (must be empty)
  const nonZeroOpeningTurn = baseTurn();
  nonZeroOpeningTurn.opening = ['Ciao.'];
  assert.throws(() => validateAndNormalizeItalianA1(nonZeroOpeningTurn, false), /invalid_response/);

  // 10. Non-empty contribution on start (must be empty)
  const nonZeroContribStart = baseStart();
  nonZeroContribStart.contribution = [['Entro.']];
  assert.throws(() => validateAndNormalizeItalianA1(nonZeroContribStart, true), /invalid_response/);

  // 11. Empty contribution on turn
  const emptyContribTurn = baseTurn();
  emptyContribTurn.contribution = [];
  assert.throws(() => validateAndNormalizeItalianA1(emptyContribTurn, false), /invalid_response/);

  // 12. Turn comment missing or wrong kind
  const wrongCommentKind = baseTurn();
  wrongCommentKind.comment = { kind: 'ironic', text: 'Non-correction' };
  assert.throws(() => validateAndNormalizeItalianA1(wrongCommentKind, false), /invalid_response/);

  const emptyCommentText = baseTurn();
  emptyCommentText.comment = { kind: 'correction', text: '   ' };
  assert.throws(() => validateAndNormalizeItalianA1(emptyCommentText, false), /invalid_response/);

  // 13. Invalid tone distribution or duplicate options
  const wrongTones = baseStart();
  wrongTones.nextQuestion.options[0].tone = 'ironic';
  wrongTones.nextQuestion.options[1].tone = 'ironic';
  assert.throws(() => validateAndNormalizeItalianA1(wrongTones, true), /invalid_response/);

  const dupOptions = baseStart();
  dupOptions.nextQuestion.options[1].text = ['Entro', 'subito.'];
  assert.throws(() => validateAndNormalizeItalianA1(dupOptions, true), /invalid_response/);
});

test('Italian A1: StoryEngine start and turn execute successfully with A1 word-array fixtures', async () => {
  const a1StartFixture = {
    opening: ['Il', 'museo', 'è', 'aperto.'],
    contribution: [],
    bridge: [],
    comment: { kind: 'neutral', text: '' },
    nextQuestion: {
      text: ['Cosa', 'fai', 'adesso?'],
      options: [
        { text: ['Entro', 'subito.'], tone: 'serious' },
        { text: ['Aspetto', 'fuori.'], tone: 'serious' },
        { text: ['Mangio', 'un', 'gelato.'], tone: 'ironic' }
      ]
    }
  };

  const a1TurnFixture = {
    opening: [],
    contribution: [
      ['Entro', 'nel', 'museo.'],
      ['Compro', 'un', 'biglietto.']
    ],
    bridge: ['La', 'guida', 'arriva.'],
    comment: {
      kind: 'correction',
      text: 'Ottimo! Korrektur: "Entro subito." (Ich trete sofort ein, Aussprache: en-tro su-bi-to).'
    },
    nextQuestion: {
      text: ['Dove', 'vai', 'ora?'],
      options: [
        { text: ['Nella', 'sala.'], tone: 'serious' },
        { text: ['Al', 'giardino.'], tone: 'serious' },
        { text: ['Sul', 'tetto.'], tone: 'ironic' }
      ]
    }
  };

  let callCount = 0;
  const a1Provider = async () => {
    callCount++;
    const payload = callCount === 1 ? a1StartFixture : a1TurnFixture;
    return {
      modelVersion: 'gemini-3.5-flash-lite',
      responseId: 'synth-a1-' + callCount,
      usageMetadata: { promptTokenCount: 150, candidatesTokenCount: 80, thoughtsTokenCount: 5, totalTokenCount: 235 },
      candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(payload) }] } }]
    };
  };

  let now = Date.parse('2026-10-25T12:00:00Z');
  const engine = new StoryEngine(a1Provider, () => (now += 1000));

  const startRes = await engine.start('tester', {
    useCaseId: 'italian-a1',
    locale: 'de',
    idempotencyKey: randomUUID()
  });

  assert.equal(startRes.state.useCaseId, 'italian-a1');
  assert.equal(startRes.state.nodes.length, 1);
  assert.equal(startRes.state.segments[0].text, 'Il museo è aperto.');
  assert.equal(startRes.state.version, 0);

  const turnInput = {
    version: 0,
    questionId: startRes.state.nodes[0].nextQuestion.id,
    selectedOptionId: startRes.state.nodes[0].nextQuestion.options[0].id,
    locale: 'de',
    idempotencyKey: randomUUID()
  };

  const turnRes = await engine.turn(startRes.state.id, 'tester', startRes.token, turnInput);
  assert.equal(turnRes.version, 1);
  assert.equal(turnRes.nodes.length, 2);
  assert.equal(turnRes.segments.length, 3); // opening, contribution, bridge
  assert.equal(turnRes.segments[1].text, 'Entro nel museo. Compro un biglietto.');
  assert.equal(turnRes.segments[2].text, 'La guida arriva.');
  assert.equal(turnRes.nodes[1].comment?.kind, 'correction');
  assert.equal(turnRes.nodes[1].comment?.text.includes('en-tro su-bi-to'), true);
  assert.equal(turnRes.nodes[1].promptVersionIds.start, 'italian-a1:v3:start');
});

test('Italian A1: invalid A1 response does NOT commit story state and properly accounts usage cost', async () => {
  const a1StartFixture = {
    opening: ['Il', 'museo', 'è', 'aperto.'],
    contribution: [],
    bridge: [],
    comment: { kind: 'neutral', text: '' },
    nextQuestion: {
      text: ['Cosa', 'fai', 'adesso?'],
      options: [
        { text: ['Entro', 'subito.'], tone: 'serious' },
        { text: ['Aspetto', 'fuori.'], tone: 'serious' },
        { text: ['Mangio', 'un', 'gelato.'], tone: 'ironic' }
      ]
    }
  };

  // Turn fixture returns an invalid sentence with 6 words (violates max 4 words)
  const a1InvalidTurnFixture = {
    opening: [],
    contribution: [
      ['Questa', 'frase', 'ha', 'troppe', 'parole', 'davvero.']
    ],
    bridge: [],
    comment: { kind: 'correction', text: 'Korrektur.' },
    nextQuestion: {
      text: ['Dove', 'vai', 'ora?'],
      options: [
        { text: ['Nella', 'sala.'], tone: 'serious' },
        { text: ['Al', 'giardino.'], tone: 'serious' },
        { text: ['Sul', 'tetto.'], tone: 'ironic' }
      ]
    }
  };

  let callCount = 0;
  const a1Provider = async () => {
    callCount++;
    const payload = callCount === 1 ? a1StartFixture : a1InvalidTurnFixture;
    return {
      modelVersion: 'gemini-3.5-flash-lite',
      responseId: 'synth-a1-' + callCount,
      usageMetadata: { promptTokenCount: 150, candidatesTokenCount: 80, thoughtsTokenCount: 5, totalTokenCount: 235 },
      candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(payload) }] } }]
    };
  };

  let now = Date.parse('2026-10-25T12:00:00Z');
  const engine = new StoryEngine(a1Provider, () => (now += 1000));

  const startRes = await engine.start('tester', {
    useCaseId: 'italian-a1',
    locale: 'de',
    idempotencyKey: randomUUID()
  });

  const stateBefore = engine.read(startRes.state.id, 'tester', startRes.token);
  assert.equal(stateBefore.version, 0);
  assert.equal(stateBefore.nodes.length, 1);
  assert.equal(stateBefore.segments.length, 1);

  const turnInput = {
    version: 0,
    questionId: startRes.state.nodes[0].nextQuestion.id,
    selectedOptionId: startRes.state.nodes[0].nextQuestion.options[0].id,
    locale: 'de',
    idempotencyKey: randomUUID()
  };

  await assert.rejects(
    () => engine.turn(startRes.state.id, 'tester', startRes.token, turnInput),
    (err: any) => err instanceof StoryError && err.code === 'invalid_response' && err.status === 502
  );

  // Story state MUST remain unchanged (no rollback corruption, no commit)
  const stateAfter = engine.read(startRes.state.id, 'tester', startRes.token);
  assert.equal(stateAfter.version, 0);
  assert.equal(stateAfter.nodes.length, 1);
  assert.equal(stateAfter.segments.length, 1);
  assert.deepEqual(stateAfter.nodes, stateBefore.nodes);
  assert.deepEqual(stateAfter.segments, stateBefore.segments);

  // Usage cost MUST be recorded with error status and charged cost
  assert.equal(stateAfter.usage.length, 2);
  const failedUsage = stateAfter.usage[1];
  assert.equal(failedUsage.status, 'error');
  assert.equal(failedUsage.errorCode, 'invalid_response');
  assert.equal(failedUsage.chargedUsd > 0, true);
  assert.equal(stateAfter.spentUsd > stateBefore.spentUsd, true);
});

