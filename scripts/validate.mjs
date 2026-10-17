import {readFileSync, existsSync} from 'node:fs';
import assert from 'node:assert/strict';

const read = p => readFileSync(new URL('../'+p, import.meta.url), 'utf8');
for (const p of ['README.md','SPEC.md','ROADMAP.md','docs/PRODUCT_CONCEPT_V1.md','docs/ARCHITECTURE_V1.md','docs/COMPONENTS_V1.md','docs/WORK_D0_EXECUTION.md','contracts/story.contracts.ts','prompts/catalog.json','observability/api-usage.schema.json']) {
  assert(existsSync(new URL('../'+p, import.meta.url)), 'Missing file: '+p);
}
const cat = JSON.parse(read('prompts/catalog.json'));
assert(cat.schemaVersion === '1.0');
assert(cat.useCases.length >= 8, 'Expected diverse use cases');
const ids = new Set();
for (const u of cat.useCases) {
  assert(!ids.has(u.id), 'Duplicate use case '+u.id); ids.add(u.id);
  for (const p of ['start','question','comment','integrate']) assert(typeof u.prompts[p]==='string' && u.prompts[p].length>25, u.id+' missing '+p);
  assert(u.tts?.model && u.textModel, u.id+' models missing');
}
const m=JSON.parse(read('packages/components/choice-panel/component.manifest.json'));
assert(m.tagName === 'sd-choice-panel' && m.events['sd:answer-submit']?.composed===true);
JSON.parse(read('observability/api-usage.schema.json'));
JSON.parse(read('observability/pricing-config.example.json'));
assert(read('.gitignore').includes('.env'));
console.log('D0 planning validation passed: '+cat.useCases.length+' use cases, 4 prompts each, contracts and manifest verified.');
