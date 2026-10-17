type Labels = Record<string,string>;
const style = "<style>:host{display:block;color:inherit;font:inherit;min-width:0}*{box-sizing:border-box}button,input,textarea,select{font:inherit}button{cursor:pointer}button:disabled{cursor:wait;opacity:.55}button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #a25b20;outline-offset:3px}button{border:1px solid #d8d3c5;border-radius:12px;background:#fffdf7;color:#30382c;padding:14px;text-align:left;overflow-wrap:anywhere}h2,h3,p{margin:0 0 12px}small{display:block;color:#62685e}input,textarea{width:100%;padding:12px;border:1px solid #aaa;border-radius:10px}textarea{min-height:100px;resize:vertical}label{display:block;margin:12px 0 6px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:12px}.stack{display:grid;gap:10px}.muted{color:#62685e}.chosen{border-color:#58714b;background:#eef3e8}.user{background:#e4ecd9;border-left:4px solid #627947}.segment{padding:16px;border-radius:10px;margin:12px 0;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.75}.comment{padding:18px;background:#f2eadb;border-radius:14px;overflow-wrap:anywhere}.tone{font-size:.8rem;margin-bottom:5px}details{margin-top:8px}summary{cursor:pointer}button.wide{width:100%}</style>";
export class StoryReader extends HTMLElement {
  private labels: Labels = {};
  private root = this.attachShadow({mode:'open'});
  connectedCallback(){ this.render(); }
  set i18n(value: Labels){ this.labels = value ?? {}; this.render(); }
  private text(key:string){ return this.labels[key] ?? ''; }
  private element<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;}
  private emit(name:string,detail:unknown){this.dispatchEvent(new CustomEvent(name,{detail,bubbles:true,composed:true}));}
  
  private items: Array<{id:string;turnId:string;text:string;kind:string;actorId:string}> = [];
  private active='';
  set segments(value:typeof this.items){this.items=value ?? [];this.render();}
  set activeNodeId(value:string){this.active=value;this.render();}
  private render(){this.root.innerHTML=style;
    if(!this.items.length)this.root.append(this.element('p',this.text('empty')));
    for(const segment of this.items){const article=this.element('article');article.className='segment '+(segment.kind==='user-contribution'?'user':'');article.dataset.segmentId=segment.id;article.tabIndex=0;article.setAttribute('role','button');article.addEventListener('click',()=>this.emit('sd:segment-select',{segmentId:segment.id}));article.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.emit('sd:segment-select',{segmentId:segment.id});}});article.setAttribute('aria-current',String(segment.turnId===this.active));
      article.append(this.element('small',segment.kind==='user-contribution'?this.text('you'):this.text('ai')),this.element('p',segment.text));
      this.root.append(article);}
  }

}
if(!customElements.get('sd-story-reader')) customElements.define('sd-story-reader',StoryReader);
