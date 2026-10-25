import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import {run} from '../../test-harness.mjs';

test('C03 standalone contracts and interactions', () => run('choice-panel', 'sd-choice-panel'));

test('C03 disabled property locks inputs without aria-busy or work status, and reactivates cleanly', () => {
  const w = new Window({url: 'http://localhost/'});
  const code = readFileSync(new URL('../dist/sd-choice-panel.js', import.meta.url), 'utf8').replace('export class', 'class');
  w.eval(code);
  const el = w.document.createElement('sd-choice-panel');
  w.document.body.append(el);
  el.i18n = {
    search: 'Search', empty: 'Empty', you: 'You', ai: 'AI',
    serious: 'Serious', ironic: 'Ironic', custom: 'Custom',
    send: 'Send', hint: '600 characters', busy: 'Working…'
  };
  const question = {
    id: 'q-test-disabled',
    text: 'What next?',
    options: [
      {id: 'opt-1', text: 'Door 1', tone: 'serious'},
      {id: 'opt-2', text: 'Door 2', tone: 'serious'},
      {id: 'opt-3', text: 'Window', tone: 'ironic'}
    ]
  };
  el.question = question;
  el.allowCustom = true;
  const root = el.shadowRoot;
  assert(root, 'Shadow root exists');

  let submissions = [];
  el.addEventListener('sd:answer-submit', ev => submissions.push(ev.detail));

  // Type draft into textarea
  const textarea = root.querySelector('textarea');
  assert(textarea);
  textarea.value = 'My pending custom answer';
  textarea.dispatchEvent(new w.Event('input'));

  // 1. Set disabled = true
  el.disabled = true;

  const section = root.querySelector('section');
  assert.equal(section.getAttribute('aria-busy'), 'false', 'aria-busy must be false when disabled but not busy');
  assert.equal(root.querySelector('[role=status]'), null, 'no work status indicator when disabled');

  // All option buttons, textarea and submit button must be disabled
  const optionButtons = root.querySelectorAll('[data-option-id]');
  assert.equal(optionButtons.length, 3);
  for (const btn of optionButtons) {
    assert.equal(btn.disabled, true, 'option button must be disabled');
  }
  const currentTextarea = root.querySelector('textarea');
  assert.equal(currentTextarea.disabled, true, 'textarea must be disabled');
  assert.equal(currentTextarea.value, 'My pending custom answer', 'draft must be preserved while disabled');
  const submitBtn = root.querySelector('form button[type=submit]');
  assert.equal(submitBtn.disabled, true, 'submit button must be disabled');

  // Attempt click and form submit while disabled - must not emit
  optionButtons[0].click();
  root.querySelector('form').dispatchEvent(new w.Event('submit', {cancelable: true}));
  assert.equal(submissions.length, 0, 'No submissions while disabled');

  // 2. Reactivate: disabled = false
  el.disabled = false;

  const reactivatedSection = root.querySelector('section');
  assert.equal(reactivatedSection.getAttribute('aria-busy'), 'false');
  assert.equal(root.querySelector('[role=status]'), null);

  const reactivatedOptions = root.querySelectorAll('[data-option-id]');
  for (const btn of reactivatedOptions) {
    assert.equal(btn.disabled, false, 'option button must be enabled after reactivating');
  }
  const reactivatedTextarea = root.querySelector('textarea');
  assert.equal(reactivatedTextarea.disabled, false, 'textarea must be enabled after reactivating');
  assert.equal(reactivatedTextarea.value, 'My pending custom answer', 'draft must remain intact after reactivating');

  // Submit now works
  reactivatedOptions[0].click();
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].selectedOptionId, 'opt-1');

  // After submission, buttons are latched (submitted=true)
  assert.equal(root.querySelector('section').getAttribute('aria-busy'), 'false');
  assert.notEqual(root.querySelector('[role=status]'), null, 'work status appears once submitted');

  w.happyDOM.abort();
});
