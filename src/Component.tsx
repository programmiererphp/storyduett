import {createElement,useLayoutEffect,useRef} from 'react';
import '../packages/components/usecase-picker/src/index';
import '../packages/components/story-reader/src/index';
import '../packages/components/choice-panel/src/index';
import '../packages/components/ai-comment/src/index';
/** Properties, not stringified attributes; listeners are removed on every cleanup. */
export function Component({tag,properties,event,onEvent}:{tag:string;properties:Record<string,unknown>;event?:string;onEvent?:(detail:any)=>void}){
 const ref=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{if(ref.current)Object.assign(ref.current,properties);},[properties]);
 useLayoutEffect(()=>{const element=ref.current;if(!element||!event||!onEvent)return;const listener=(e:Event)=>onEvent((e as CustomEvent).detail);element.addEventListener(event,listener);return()=>element.removeEventListener(event,listener);},[event,onEvent]);
 return createElement(tag,{ref});
}
