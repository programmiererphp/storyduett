const PALETTE = ['#e4ece6', '#f2ece1', '#eae6f2', '#f5e7e4', '#e2ecf5'];
function getActorColor(actorId) {
    if (!actorId || actorId === 'ai')
        return 'transparent';
    if (actorId === 'solo')
        return '#eceef0';
    let hash = 0;
    for (let i = 0; i < actorId.length; i++) {
        hash = (hash * 31 + actorId.charCodeAt(i)) >>> 0;
    }
    return PALETTE[hash % PALETTE.length];
}
const style = `<style>
:host {
  display: block;
  color: #24292e;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 1.125rem;
  line-height: 1.85;
  min-width: 0;
}
* { box-sizing: border-box; }
.reader-container {
  max-width: 72ch;
  margin: 0 auto;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  padding: 4px 0 12px 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 0.825rem;
  color: #62685e;
  border-bottom: 1px solid #e5e2d8;
  margin-bottom: 18px;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}
.surface {
  margin: 0 0 18px 0;
  white-space: normal;
  overflow-wrap: anywhere;
}
.segment {
  display: inline;
  padding: 0;
  border-radius: 3px;
  cursor: pointer;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  transition: outline 0.15s ease;
}
.segment:focus-visible {
  outline: 2px solid #58714b;
  outline-offset: 2px;
}
.segment.user { padding: 0 .08em; }
.empty {
  color: #62685e;
  font-style: italic;
  margin: 0;
}
</style>`;
export class StoryReader extends HTMLElement {
    labels = {};
    actorLabelsMap = {};
    currentPresentation = 'prose';
    items = [];
    active = '';
    root = this.attachShadow({ mode: 'open' });
    connectedCallback() {
        this.render();
    }
    set i18n(value) {
        this.labels = value ?? {};
        this.render();
    }
    set presentation(value) {
        this.currentPresentation = (value === 'language' || value === 'learning') ? value : 'prose';
        this.render();
    }
    get presentation() {
        return this.currentPresentation;
    }
    set actorLabels(value) {
        this.actorLabelsMap = value ?? {};
        this.render();
    }
    get actorLabels() {
        return this.actorLabelsMap;
    }
    set segments(value) {
        this.items = value ?? [];
        this.render();
    }
    get segments() {
        return this.items;
    }
    set activeNodeId(value) {
        this.active = value ?? '';
        this.render();
    }
    get activeNodeId() {
        return this.active;
    }
    text(key) {
        return this.labels[key] ?? '';
    }
    getActorName(actorId) {
        if (actorId === 'ai')
            return this.text('ai') || actorId;
        if (typeof this.actorLabelsMap[actorId] === 'string' && this.actorLabelsMap[actorId])
            return this.actorLabelsMap[actorId];
        if (actorId === 'solo')
            return this.text('you') || actorId;
        return actorId;
    }
    element(tag, text) {
        const el = document.createElement(tag);
        if (text !== undefined)
            el.textContent = text;
        return el;
    }
    emit(name, detail) {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    }
    createSegmentSpan(segment) {
        const span = this.element('span');
        span.className = 'segment' + (segment.turnId === this.active ? ' active' : '');
        if (segment.actorId !== 'ai')
            span.classList.add('user');
        span.dataset.segmentId = segment.id;
        span.dataset.actorId = segment.actorId;
        span.tabIndex = 0;
        span.setAttribute('role', 'button');
        span.setAttribute('aria-current', String(segment.turnId === this.active));
        const author = this.getActorName(segment.actorId);
        span.title = author;
        span.setAttribute('aria-label', `${author}: ${segment.text}`);
        const bg = getActorColor(segment.actorId);
        if (bg !== 'transparent') {
            span.style.backgroundColor = bg;
        }
        span.textContent = segment.text;
        span.addEventListener('click', () => this.emit('sd:segment-select', { segmentId: segment.id }));
        span.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.emit('sd:segment-select', { segmentId: segment.id });
            }
        });
        return span;
    }
    render() {
        this.root.innerHTML = style;
        const container = this.element('div');
        container.className = 'reader-container';
        if (!this.items.length) {
            container.append(this.element('p', this.text('empty')));
            this.root.append(container);
            return;
        }
        // Shared author legend
        const uniqueActors = [];
        for (const seg of this.items) {
            if (!uniqueActors.includes(seg.actorId)) {
                uniqueActors.push(seg.actorId);
            }
        }
        const legend = this.element('div');
        legend.className = 'legend';
        legend.setAttribute('role', 'group');
        legend.setAttribute('aria-label', this.text('authors'));
        for (const actorId of uniqueActors) {
            const item = this.element('span');
            item.className = 'legend-item';
            const swatch = this.element('span');
            swatch.className = 'swatch';
            const color = getActorColor(actorId);
            swatch.style.backgroundColor = color === 'transparent' ? '#ffffff' : color;
            const name = this.element('span', this.getActorName(actorId));
            item.append(swatch, name);
            legend.append(item);
        }
        container.append(legend);
        // Render segments according to presentation mode
        if (this.currentPresentation === 'prose') {
            const p = this.element('p');
            p.className = 'surface prose-surface';
            for (let i = 0; i < this.items.length; i++) {
                if (i > 0)
                    p.append(document.createTextNode(' '));
                p.append(this.createSegmentSpan(this.items[i]));
            }
            container.append(p);
        }
        else {
            // 'language' or 'learning': group by turnId into coherent paragraphs
            const turns = [];
            for (const seg of this.items) {
                const lastTurn = turns[turns.length - 1];
                if (lastTurn && lastTurn.turnId === seg.turnId) {
                    lastTurn.segments.push(seg);
                }
                else {
                    turns.push({ turnId: seg.turnId, segments: [seg] });
                }
            }
            for (const turn of turns) {
                const p = this.element('p');
                p.className = `surface turn-paragraph mode-${this.currentPresentation}`;
                p.dataset.turnId = turn.turnId;
                for (let i = 0; i < turn.segments.length; i++) {
                    if (i > 0)
                        p.append(document.createTextNode(' '));
                    p.append(this.createSegmentSpan(turn.segments[i]));
                }
                container.append(p);
            }
        }
        this.root.append(container);
    }
}
if (!customElements.get('sd-story-reader')) {
    customElements.define('sd-story-reader', StoryReader);
}
