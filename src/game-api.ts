import type {State} from '../server/story-engine';
export type {State};
export class ApiError extends Error{constructor(public code:string,public confirmed:boolean){super(code);}}
export async function gameRequest<T>(path:string,body?:unknown,token?:string,method=body?'POST':'GET'):Promise<T>{
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),45000);
 try{const r=await fetch(path,{method,credentials:'same-origin',cache:'no-store',signal:controller.signal,headers:{'Content-Type':'application/json','x-sd-request':'1',...(token?{'x-sd-session':token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 if(r.status===204)return undefined as T;
 let data;try{data=await r.json();}catch{throw new ApiError('invalid_response',false);}
 if(!r.ok)throw new ApiError(data.error??'provider_error',true);return data as T;
 }catch(e){if(e instanceof ApiError)throw e;throw new ApiError(controller.signal.aborted?'timeout':'network',false);}finally{clearTimeout(timeout);}
}
