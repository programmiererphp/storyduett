type Labels = Record<string,string>;
const style = "<style>:host{display:block;color:inherit;font:inherit;min-width:0}*{box-sizing:border-box}button,input,textarea,select{font:inherit}button{cursor:pointer}button:disabled{cursor:wait;opacity:.55}button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #a25b20;outline-offset:3px}button{border:1px solid #d8d3c5;border-radius:12px;background:#fffdf7;color:#30382c;padding:14px;text-align:left;overflow-wrap:anywhere}h2,h3,p{margin:0 0 12px}small{display:block;color:#62685e}input,textarea{width:100%;padding:12px;border:1px solid #aaa;border-radius:10px}textarea{min-height:100px;resize:vertical}label{display:block;margin:12px 0 6px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:12px}.stack{display:grid;gap:10px}.muted{color:#62685e}.chosen{border-color:#58714b;background:#eef3e8}.user{background:#e4ecd9;border-left:4px solid #627947}.segment{padding:16px;border-radius:10px;margin:12px 0;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.75}.comment{padding:18px;background:#f2eadb;border-radius:14px;overflow-wrap:anywhere}.tone{font-size:.8rem;margin-bottom:5px}details{margin-top:8px}summary{cursor:pointer}button.wide{width:100%}</style>";
export class AiComment extends HTMLElement {
  private labels: Labels = {};
  private root = this.attachShadow({mode:'open'});
  connectedCallback(){ this.render(); }
  set i18n(value: Labels){ this.labels = value ?? {}; this.render(); }
  private text(key:string){ return this.labels[key] ?? ''; }
  private element<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;}
  private emit(name:string,detail:unknown){this.dispatchEvent(new CustomEvent(name,{detail,bubbles:true,composed:true}));}
  
  private value:{kind:string;text:string}|null=null; private extra='';
  set comment(value:typeof this.value){this.value=value;this.render();}
  set context(value:string){this.extra=value??'';this.render();}
  private render(){this.root.innerHTML=style;if(!this.value)return;
    const box=this.element('aside');box.className='comment';box.setAttribute('role','status');box.append(this.element('small',this.text(this.value.kind)||this.text('ai')),this.element('p',this.value.text));
    if(this.extra){const details=this.element('details');details.append(this.element('summary',this.text('original')),this.element('p',this.extra));details.addEventListener('toggle',()=>{if(details.open)this.emit('sd:comment-expand',{expanded:true});});box.append(details);}this.root.append(box);
  }

}
if(!customElements.get('sd-ai-comment')) customElements.define('sd-ai-comment',AiComment);
