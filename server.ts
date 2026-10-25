import express from 'express';
import {randomBytes} from 'node:crypto';
import {StoryEngine,StoryError,MODEL,LIMITS,resolveServerApiKey} from './server/story-engine';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

// Explicit projection: public responses never include provider config or prompts.
export function getPublicCatalog() {
  const catalog = JSON.parse(readFileSync(join(root, 'prompts/catalog.json'), 'utf8'));
  if (catalog.schemaVersion !== '1.0' || !Array.isArray(catalog.useCases)) throw new Error('Invalid catalog');
  const ids = new Set<string>();
  const useCases = catalog.useCases.filter((u: any) => u.enabled === true).map((u: any) => {
    if (typeof u.id !== 'string' || !u.id || ids.has(u.id) || typeof u.name !== 'string' ||
        typeof u.language !== 'string' || !Number.isInteger(u.version)) throw new Error('Invalid entry');
    ids.add(u.id);
    return { id: u.id, name: u.name, version: u.version, language: u.language, enabled: true };
  });
  return { schemaVersion: '1.0', delivery: 'D1', useCases };
}

export function createApi(loadCatalog = getPublicCatalog, engine = new StoryEngine()) {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.get('/api/health', (_req, res) => {
    try {
      const catalog = loadCatalog();
      res.json({ status: 'ok', version: 'D1', delivery: 'D1', timestamp: new Date().toISOString(),
        catalogUseCasesCount: catalog.useCases.length });
    } catch {
      res.status(503).json({ status: 'error', version: 'D1', error: 'Catalog unavailable' });
    }
  });
  app.get('/api/use-cases', (_req, res) => {
    try { res.json(loadCatalog()); }
    catch { res.status(503).json({ error: 'Catalog unavailable' }); }
  });
  app.use('/api', express.json({limit:'4kb'}));
  const owners = new Map<string,number>();
  function owner(req:express.Request,res:express.Response){
    let id=req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('sd_owner='))?.slice(9);
    if(!id||!owners.has(id)){
      for(const [key,until] of owners)if(until<Date.now())owners.delete(key);
      if(owners.size>=10000)throw new StoryError('capacity',503);
      id=randomBytes(32).toString('hex');owners.set(id,Date.now()+24*60*60*1000);
      res.cookie('sd_owner',id,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:process.env.NODE_ENV==='production'?'none':'lax',partitioned:process.env.NODE_ENV==='production',maxAge:24*60*60*1000,path:'/api'});
    }
    return id;
  }
  // JSON + a non-simple header prevents cross-site form/CSRF requests. Never enable CORS.
  app.use('/api/sessions',(req,res,next)=>{
    if(req.method!=='GET'&&req.headers['x-sd-request']!=='1'){res.status(403).json({error:'forbidden'});return;}
    if(req.headers['sec-fetch-site']==='cross-site'){res.status(403).json({error:'forbidden'});return;}
    next();
  });
  app.get('/api/play-config',(_req,res)=>{owner(_req,res);res.json({model:MODEL,limits:{callUsd:LIMITS.call,sessionUsd:LIMITS.session,maxTurns:LIMITS.turns},ready:Boolean(resolveServerApiKey()),sessionTtlHours:2});});
  const route=(fn:(req:express.Request,res:express.Response)=>Promise<void>|void)=>(req:express.Request,res:express.Response,next:express.NextFunction)=>{Promise.resolve().then(()=>fn(req,res)).catch(next);};
  app.post('/api/sessions',route(async(req,res)=>{res.json(await engine.start(owner(req,res),req.body));}));
  app.get('/api/sessions/:id',route((req,res)=>{res.json({state:engine.read(String(req.params.id),owner(req,res),String(req.headers['x-sd-session']??''))});}));
  app.post('/api/sessions/:id/turns',route(async(req,res)=>{res.json({state:await engine.turn(String(req.params.id),owner(req,res),String(req.headers['x-sd-session']??''),req.body)});}));
  app.delete('/api/sessions/:id',route((req,res)=>{engine.remove(String(req.params.id),owner(req,res),String(req.headers['x-sd-session']??''));res.status(204).end();}));
  app.use('/api',(error:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{const known=error instanceof StoryError;res.status(known?error.status:error.type==='entity.too.large'?413:400).json({error:known?error.code:'invalid_input',...(known&&error.errorInfoReason?{reason:error.errorInfoReason}:{})});});
  app.all(['/api', '/api/*'], (_req, res) => { res.status(404).json({ error: 'Endpoint not found' }); });
  return app;
}

export async function setupApp() {
  const app = createApi();
  app.use(express.static(join(root, 'dist')));
  app.get('*', (_req, res) => { res.sendFile(join(root, 'dist/index.html')); });
  return app;
}

if (process.env.NODE_ENV !== 'test') {
  setupApp().then(app => {
    const server = app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0', () => {
      const address = server.address();
      console.log(`STORYDUETT_READY ${typeof address === 'object' ? address?.port : ''}`);
    });
    process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
  }).catch(() => { console.error('StoryDuett failed to start'); process.exit(1); });
}
