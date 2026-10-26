import {useState,useEffect,useRef} from 'react';
import {BookOpen,ArrowLeft,RefreshCw} from 'lucide-react';
import {Component} from './Component';
import {gameRequest,ApiError,type State} from './game-api';
import type {CatalogResponse,Locale,HealthResponse} from './types';
import de from './i18n/de.json';import en from './i18n/en.json';import ru from './i18n/ru.json';
const dictionaries={de,en,ru};
type Pending={path:string;body:Record<string,unknown>;token?:string};
export default function App(){
 const [locale,setLocale]=useState<Locale>('de'),t=dictionaries[locale],g=t.game;
 const [catalog,setCatalog]=useState<CatalogResponse|null>(null),[health,setHealth]=useState<HealthResponse|null>(null),[config,setConfig]=useState<{ready:boolean;model:string;limits:{callUsd:number;sessionUsd:number}}|null>(null);
 const [selected,setSelected]=useState('fiction'),[filter,setFilter]=useState('all'),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[state,setState]=useState<State|null>(null),[token,setToken]=useState(''),[limit,setLimit]=useState('0.10');
 const [pending,setPending]=useState<Pending|null>(null);const lock=useRef(false);const questionRef=useRef<HTMLDivElement>(null);const [catalogFailed,setCatalogFailed]=useState(false);
 useEffect(()=>{document.documentElement.lang=locale;document.title=`StoryDuett – ${g.badge}`;},[locale,g.badge]);
 async function load(){setCatalogFailed(false);try{const [c,h,p]=await Promise.all([gameRequest<CatalogResponse>('/api/use-cases'),gameRequest<HealthResponse>('/api/health'),gameRequest<typeof config>('/api/play-config')]);setCatalog(c);setHealth(h);setConfig(p);}catch{setCatalogFailed(true);}}
 useEffect(()=>{void load();},[]);
 const money=(v:number)=>new Intl.NumberFormat(locale,{style:'currency',currency:'USD',minimumFractionDigits:4,maximumFractionDigits:4}).format(v);
 async function perform(request:Pending){
  if(lock.current)return;lock.current=true;setBusy(true);setError(null);setPending(request);
  try{const result=await gameRequest<{state:State;token?:string}>(request.path,request.body,request.token);setState(result.state);if(result.token)setToken(result.token);setPending(null);setTimeout(()=>questionRef.current?.focus(),0);}
  catch(e){const failure=e instanceof ApiError?e:new ApiError('network',false);setError(failure.code);if(failure.confirmed)setPending({...request,body:{...request.body,idempotencyKey:crypto.randomUUID()}});
   if(state&&request.token){try{const current=await gameRequest<{state:State}>(`/api/sessions/${state.id}`,undefined,request.token);setState(current.state);}catch{/* Existing visible story remains available. */}}
  }finally{lock.current=false;setBusy(false);}
 }
 function start(){void perform({path:'/api/sessions',body:{useCaseId:selected,locale,limitUsd:Number(limit),idempotencyKey:crypto.randomUUID()}});}
 function answer(detail:any){if(!state||lock.current)return;void perform({path:`/api/sessions/${state.id}/turns`,token,body:{...detail,version:state.version,locale,idempotencyKey:crypto.randomUUID()}});}
 async function end(){if(busy||!state)return;try{await gameRequest(`/api/sessions/${state.id}`,undefined,token,'DELETE');setState(null);setToken('');setError(null);setPending(null);}catch(e){if(e instanceof ApiError&&['session_missing','session_expired'].includes(e.code)){setState(null);setToken('');setError(null);setPending(null);}else setError(e instanceof ApiError?e.code:'network');}}
 const cases=catalog?.useCases.filter(c=>filter==='all'||c.language===filter).map(c=>({...c,name:t.cases[c.id as keyof typeof t.cases]?.name??c.name,summary:t.cases[c.id as keyof typeof t.cases]?.summary??''}))??[];
 const last=state?.nodes.at(-1),lastUsage=state?.usage.at(-1);const blocked=error?['session_budget','daily_budget','call_budget','context_limit','turn_limit','pricing_expired'].includes(error):false;
 const activeCase=catalog?.useCases.find(c=>c.id===(state?state.useCaseId:selected));
 return <div className="shell">
  <header className="masthead"><a href="#" className="brand" aria-label="StoryDuett"><BookOpen aria-hidden="true"/><span>StoryDuett<small>{g.badge}</small></span></a><nav aria-label={t.nav.languageAria}>{(['de','en','ru'] as Locale[]).map(l=><button key={l} className="locale" aria-pressed={locale===l} onClick={()=>setLocale(l)}>{l.toUpperCase()}</button>)}</nav></header>
  <main>
   <div className="eyebrow">{g.eyebrow}</div><h1>{state?(t.cases[state.useCaseId as keyof typeof t.cases]?.name??g.story):g.title}</h1><p className="intro">{state?g.playIntro:g.intro}</p>
   <div className="service"><span className={health?'dot':'dot offline'}/><span>{health?g.online:g.connecting}</span><span>{g.model}: {config?.model??'—'}</span><button className="icon-button" onClick={()=>void load()} aria-label={t.health.refreshAria}><RefreshCw size={16}/></button></div>
   {catalogFailed&&<div className="notice error" role="alert">{t.catalog.loadError} <button onClick={()=>void load()}>{t.catalog.retry}</button></div>}
   {config&&!config.ready&&<div className="notice error" role="alert">{g.errors.provider_unavailable}</div>}
   {error&&<div className="notice error" role="alert"><strong>{g.errorTitle}</strong><p>{g.errors[error as keyof typeof g.errors]??g.errors.provider_error}</p>{pending&&!blocked&&<button disabled={busy} onClick={()=>void perform(pending)}>{g.retry}</button>}</div>}
   {!state?<>
    <section className="panel" aria-labelledby="pick"><div className="section-heading"><span className="step">01</span><div><h2 id="pick">{g.pick}</h2><p>{g.pickHelp}</p></div></div>
     <div className="filters">{['all','de','it'].map(l=><button key={l} aria-pressed={filter===l} onClick={()=>{setFilter(l);const first=catalog?.useCases.find(c=>l==='all'||c.language===l);if(first&&l!=='all'&&catalog?.useCases.find(c=>c.id===selected)?.language!==l)setSelected(first.id);}}>{l==='all'?t.catalog.filterAll:t.languages[l as 'de'|'it']}</button>)}</div>
     <Component tag="sd-usecase-picker" properties={{useCases:cases,selectedId:selected,busy,i18n:g.components}} event="sd:usecase-select" onEvent={d=>{setSelected(d.useCaseId);setError(null);setPending(null);}}/>
     {activeCase?.integratePrompt&&<details className="integrate-info"><summary>{g.howIntegrated} · v{activeCase.version}</summary><p>{activeCase.integratePrompt}</p></details>}
    </section>
    <section className="start-bar"><div><p className="selected-case">{g.selected}: {t.cases[selected as keyof typeof t.cases]?.name}</p><label htmlFor="limit">{g.sessionLimit}</label><select id="limit" value={limit} disabled={busy} onChange={e=>setLimit(e.target.value)}><option value="0.10">{money(.1)}</option><option value="0.01">{money(.01)}</option><option value="0">{money(0)}</option></select><small>{g.limitHelp} {g.callLimit}: {money(config?.limits.callUsd??.01)}</small></div><button className="primary" disabled={busy||!config?.ready||!catalog} onClick={start}>{busy?g.components.busy:g.start} <span aria-hidden="true">↗</span></button></section>
    <p className="privacy">{g.privacy}</p>
   </>:<>
    <div className="game-meta"><button onClick={()=>void end()} disabled={busy}><ArrowLeft size={16}/>{g.finish}</button><span>{g.round} {state.version} / 30</span><span>{g.estimated}: <strong>{money(state.spentUsd)}</strong> / {money(state.limitUsd)}</span></div>
    <section className="panel story" aria-label={g.story}><div className="section-heading"><span className="step">02</span><h2>{g.story}</h2></div><Component tag="sd-story-reader" properties={{segments:state.segments,activeNodeId:last?.id,presentation:activeCase?.presentation??'prose',i18n:g.components}}/>{activeCase?.integratePrompt&&<details className="integrate-info"><summary>{g.howIntegrated} · v{activeCase.version}</summary><p>{activeCase.integratePrompt}</p></details>}</section>
    {last?.comment&&<Component tag="sd-ai-comment" properties={{comment:last.comment,context:last.rawAnswer??'',i18n:g.components}}/>}
    <section className="panel action" ref={questionRef} tabIndex={-1} aria-label={g.next}><div className="eyebrow">{g.next}</div><Component tag="sd-choice-panel" properties={{question:last?.nextQuestion,busy,disabled:blocked,allowCustom:true,i18n:g.components}} event="sd:answer-submit" onEvent={answer}/></section>
    <details className="usage"><summary>{g.usage}</summary><p>{g.costNote}</p><p>{g.calls}: {state.usage.filter(u=>u.status!=='blocked').length} · {g.lastCall}: {lastUsage?.status} · {lastUsage?.modelVersion??config?.model} · {lastUsage?.inputTokens??'—'} / {lastUsage?.outputTokens??'—'} / {lastUsage?.thinkingTokens??'—'} {g.tokens}</p><p>{g.callLimit}: {money(.01)} · {g.sessionLimit}: {money(state.limitUsd)}</p></details>
   </>}
  </main><footer>StoryDuett · {g.footer}</footer>
 </div>;
}
