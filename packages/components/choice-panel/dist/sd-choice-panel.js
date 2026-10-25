const style = "<style>:host{display:block;color:inherit;font:inherit;min-width:0}*{box-sizing:border-box}button,input,textarea,select{font:inherit}button{cursor:pointer}button:disabled{cursor:wait;opacity:.55}button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #a25b20;outline-offset:3px}button{border:1px solid #d8d3c5;border-radius:12px;background:#fffdf7;color:#30382c;padding:14px;text-align:left;overflow-wrap:anywhere}h2,h3,p{margin:0 0 12px}small{display:block;color:#62685e}input,textarea{width:100%;padding:12px;border:1px solid #aaa;border-radius:10px}textarea{min-height:100px;resize:vertical}label{display:block;margin:12px 0 6px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:12px}.stack{display:grid;gap:10px}.muted{color:#62685e}.chosen{border-color:#58714b;background:#eef3e8}.user{background:#e4ecd9;border-left:4px solid #627947}.segment{padding:16px;border-radius:10px;margin:12px 0;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.75}.comment{padding:18px;background:#f2eadb;border-radius:14px;overflow-wrap:anywhere}.tone{font-size:.8rem;margin-bottom:5px}details{margin-top:8px}summary{cursor:pointer}button.wide{width:100%}</style>";
export class ChoicePanel extends HTMLElement {
    labels = {};
    root = this.attachShadow({ mode: 'open' });
    connectedCallback() { this.render(); }
    set i18n(value) { this.labels = value ?? {}; this.render(); }
    text(key) { return this.labels[key] ?? ''; }
    element(tag, text) { const el = document.createElement(tag); if (text !== undefined)
        el.textContent = text; return el; }
    emit(name, detail) { this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true })); }
    value = null;
    locked = false;
    submitted = false;
    custom = true;
    draft = '';
    _disabled = false;
    get disabled() { return this._disabled; }
    set disabled(value) { this._disabled = Boolean(value); this.render(); }
    get busy() { return this.locked; }
    set busy(value) { this.locked = Boolean(value); if (!value)
        this.submitted = false; this.render(); }
    set question(value) { if (value?.id !== this.value?.id) {
        this.submitted = false;
        this.draft = '';
    } this.value = value; this.render(); }
    set allowCustom(value) { this.custom = Boolean(value); this.render(); }
    submit(detail) { if (this.locked || this.submitted || this._disabled || !this.value)
        return; this.submitted = true; this.render(); this.emit('sd:answer-submit', { questionId: this.value.id, ...detail }); }
    render() {
        this.root.innerHTML = style;
        const q = this.value;
        if (!q || q.options.length !== 3 || q.options.filter(o => o.tone === 'serious').length !== 2 || q.options.filter(o => o.tone === 'ironic').length !== 1) {
            this.root.append(this.element('p', this.text('empty')));
            return;
        }
        const section = this.element('section');
        section.setAttribute('aria-busy', String(this.locked));
        const heading = this.element('h2', q.text);
        heading.id = 'question';
        section.setAttribute('aria-labelledby', 'question');
        section.append(heading);
        const list = this.element('div');
        list.className = 'stack';
        const isLocked = this.locked || this.submitted || this._disabled;
        for (const [index, option] of q.options.entries()) {
            const button = this.element('button');
            button.type = 'button';
            button.disabled = isLocked;
            button.dataset.optionId = option.id;
            const tone = this.element('small', String.fromCharCode(65 + index) + ' · ' + this.text(option.tone));
            tone.className = 'tone';
            button.append(tone, this.element('span', option.text));
            button.addEventListener('click', () => this.submit({ selectedOptionId: option.id }));
            list.append(button);
        }
        section.append(list);
        if (this.custom) {
            const form = this.element('form');
            const label = this.element('label', this.text('custom'));
            label.htmlFor = 'answer';
            const input = this.element('textarea');
            input.id = 'answer';
            input.maxLength = 600;
            input.value = this.draft;
            input.disabled = isLocked;
            input.required = true;
            input.addEventListener('input', () => { this.draft = input.value; });
            const hint = this.element('small', this.text('hint'));
            const send = this.element('button', this.text('send'));
            send.type = 'submit';
            send.disabled = isLocked;
            form.append(label, input, hint, send);
            form.addEventListener('submit', e => { e.preventDefault(); if (!isLocked && this.draft.trim())
                this.submit({ customAnswer: this.draft }); });
            section.append(form);
        }
        if (this.locked || this.submitted) {
            const status = this.element('p', this.text('busy'));
            status.setAttribute('role', 'status');
            section.append(status);
        }
        this.root.append(section);
    }
}
if (!customElements.get('sd-choice-panel'))
    customElements.define('sd-choice-panel', ChoicePanel);
