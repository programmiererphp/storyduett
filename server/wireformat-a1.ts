import { StoryError } from './errors';

export type A1ValidationCode = 'root' | 'word_array' | 'word_count' | 'word_token' | 'word_currency' | 'word_symbol' | 'word_punctuation' | 'sentence_boundary' | 'sentence_count' | 'inactive_field' | 'contribution' | 'comment' | 'question' | 'options' | 'option_tones' | 'option_duplicate';
export class A1ValidationError extends StoryError {
  constructor(public validationCode: A1ValidationCode) { super('invalid_response', 502); }
}

// Punctuation can surround a word, but cannot join several words in one slot.
const SINGLE_WORD_REGEX = /^[«"'“‘(]*(?:[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:['’\-][\p{L}\p{N}][\p{L}\p{M}\p{N}]*)*|[0-9]{1,2}:[0-9]{2})[.,!?:;»"'”’)…]*$/u;

export function isSingleItalianWord(item: unknown): item is string {
  return typeof item === 'string' &&
    item.length > 0 &&
    !/\s/.test(item) &&
    /[\p{L}\p{N}]/u.test(item) &&
    SINGLE_WORD_REGEX.test(item);
}

function invalidWord(word: string): A1ValidationError {
  return new A1ValidationError(/[€$£]/u.test(word) ? 'word_currency' : /^\p{P}+$/u.test(word) ? 'word_punctuation' : /[^\p{L}\p{M}\p{N}\p{P}]/u.test(word) ? 'word_symbol' : 'word_token');
}

export function validateWordArray(
  arr: unknown,
  minWords: number,
  maxWords: number
): string[] {
  if (!Array.isArray(arr)) {
    throw new A1ValidationError('word_array');
  }
  if (arr.length < minWords || arr.length > maxWords) {
    throw new A1ValidationError('word_count');
  }
  // Canonicalize layout only: preserve every word and punctuation mark.
  // The four-word bound applies to actual words, even if a provider bundles them.
  const words: string[] = [];
  let prefix = '';
  for (const item of arr) {
    if (typeof item !== 'string' || !item.trim()) throw new A1ValidationError('word_token');
    for (const token of item.trim().split(/\s+/u)) {
      if (/^[«“‘(]+$/u.test(token) || (/^["']+$/u.test(token) && words.length === 0)) { prefix += token; continue; }
      if (/^[.,!?:;»"'”’)…]+$/u.test(token) && words.length) {
        words[words.length - 1] += token;
        continue;
      }
      const word = prefix + token;
      prefix = '';
      if (!isSingleItalianWord(word)) throw invalidWord(word);
      words.push(word);
    }
  }
  if (prefix) throw new A1ValidationError('word_punctuation');
  for (const word of words) if (!isSingleItalianWord(word)) throw invalidWord(word);
  if (words.length < minWords || words.length > maxWords) throw new A1ValidationError('word_count');
  return words;
}

export const italianA1Schema = {
  type: 'object',
  description: 'Italian A1 word arrays with server-validated single words and a maximum of 4 words per sentence.',
  properties: {
    opening: {
      type: 'array',
      description: 'Italian opening sentence as an array of 1 to 4 single words. Empty array [] on non-start turns.',
      maxItems: 4,
      items: { type: 'string' }
    },
    contribution: {
      type: 'array',
      description: 'Array of at most 3 sentences continuing the story. Each sentence is an array of 1 to 4 single words. Empty array [] on start.',
      maxItems: 3,
      items: {
        type: 'array',
        maxItems: 4,
        items: { type: 'string' }
      }
    },
    bridge: {
      type: 'array',
      description: 'Optional AI bridge sentence as an array of at most 4 single words. Empty array [] if unused.',
      maxItems: 4,
      items: { type: 'string' }
    },
    comment: {
      type: 'object',
      description: 'German feedback: neutral with empty text on start, correction on later turns. Correct an actual error without invented grammar explanations; provide corrected sentence, German meaning and pronunciation aid.',
      properties: {
        kind: { type: 'string', enum: ['ironic', 'neutral', 'correction', 'coaching'] },
        text: { type: 'string' }
      },
      required: ['kind', 'text']
    },
    nextQuestion: {
      type: 'object',
      properties: {
        text: {
          type: 'array',
          description: 'Follow-up question in Italian as an array of 1 to 4 single words.',
          maxItems: 4,
          items: { type: 'string' }
        },
        options: {
          type: 'array',
          minItems: 3,
          maxItems: 3,
          items: {
            type: 'object',
            properties: {
              text: {
                type: 'array',
                description: 'Answer option in Italian as an array of 1 to 4 single words.',
                maxItems: 4,
                items: { type: 'string' }
              },
              tone: { type: 'string', enum: ['serious', 'ironic'] }
            },
            required: ['text', 'tone']
          }
        }
      },
      required: ['text', 'options']
    }
  },
  required: ['opening', 'contribution', 'bridge', 'comment', 'nextQuestion']
};

export interface NormalizedGeneration {
  opening: string;
  contribution: string;
  bridge: string;
  comment: {
    kind: 'ironic' | 'neutral' | 'correction' | 'coaching';
    text: string;
  };
  nextQuestion: {
    text: string;
    options: Array<{
      text: string;
      tone: 'serious' | 'ironic';
    }>;
  };
}

// Supported enum and array bounds constrain provider output before semantic validation.
// Never mutate the shared base schema between concurrent start/turn requests.
export function italianA1SchemaFor(start: boolean) {
  const p = italianA1Schema.properties;
  const schema = {...italianA1Schema, properties: {...p,
    opening: {...p.opening, minItems: start ? 1 : 0, maxItems: start ? 4 : 0},
    contribution: {...p.contribution, minItems: start ? 0 : 1, maxItems: start ? 0 : 3,
      items: {...p.contribution.items, minItems: 1}},
    bridge: {...p.bridge, maxItems: start ? 0 : 4},
    comment: {...p.comment, properties: {...p.comment.properties,
      kind: {type: 'string', enum: [start ? 'neutral' : 'correction']}}}
  }};
  // Descriptions are redundant with the bounded system instructions; keep validation keywords.
  return JSON.parse(JSON.stringify(schema,(key,value)=>key==='description'?undefined:value)) as typeof schema;
}

function sentence(words:string[]):string {
  // Canonicalize the delimiter; verify actual sentence counts after joining arrays.
  const text=words.join(' ').trim();
  return /[.!?…][»"”)]*$/u.test(text)?text:text.replace(/[,;:]+$/u,'')+'.';
}

function verifySentences(text:string,maxSentences:number):void {
  const sentences=text.split(/[.!?…]+/u).map(s=>s.trim()).filter(s=>/[\p{L}\p{N}]/u.test(s));
  if(sentences.length>maxSentences||sentences.some(s=>s.split(/\s+/u).filter(word=>/[\p{L}\p{N}]/u.test(word)).length>4))throw new A1ValidationError('sentence_count');
}

export function validateAndNormalizeItalianA1(raw: any, start: boolean): NormalizedGeneration {
  if (!raw || typeof raw !== 'object') {
    throw new A1ValidationError('root');
  }

  // 1. opening
  let openingStr = '';
  if (start) {
    const words = validateWordArray(raw.opening, 1, 4);
    openingStr = sentence(words);
  } else {
    if (!Array.isArray(raw.opening) || raw.opening.length !== 0) {
      throw new A1ValidationError('inactive_field');
    }
  }

  // 2. contribution
  let contributionStr = '';
  if (start) {
    if (!Array.isArray(raw.contribution) || raw.contribution.length !== 0) {
      throw new A1ValidationError('contribution');
    }
  } else {
    if (!Array.isArray(raw.contribution) || raw.contribution.length < 1 || raw.contribution.length > 3) {
      throw new A1ValidationError('contribution');
    }
    const sentences: string[] = [];
    for (const sentArr of raw.contribution) {
      // A bundled array may contain multiple short sentences; final semantic bounds are authoritative.
      const sentWords = validateWordArray(sentArr, 1, 12);
      sentences.push(sentence(sentWords));
    }
    contributionStr = sentences.join(' ').trim();
    if (!contributionStr) {
      throw new A1ValidationError('contribution');
    }
  }

  // 3. bridge
  let bridgeStr = '';
  if (start) {
    if (!Array.isArray(raw.bridge) || raw.bridge.length !== 0) {
      throw new A1ValidationError('inactive_field');
    }
  } else {
    if (!Array.isArray(raw.bridge) || raw.bridge.length > 4) {
      throw new A1ValidationError('inactive_field');
    }
    if (raw.bridge.length > 0) {
      const bridgeWords = validateWordArray(raw.bridge, 1, 4);
      bridgeStr = sentence(bridgeWords);
    }
  }

  // 4. comment
  const comment = raw.comment;
  if (!comment || typeof comment !== 'object') {
    throw new A1ValidationError('comment');
  }
  if (start) {
    if (typeof comment.text !== 'string' || comment.text.length > 500) {
      throw new A1ValidationError('comment');
    }
  } else {
    if (
      comment.kind !== 'correction' ||
      typeof comment.text !== 'string' ||
      comment.text.trim().length === 0 ||
      comment.text.length > 500
    ) {
      throw new A1ValidationError('comment');
    }
  }

  // 5. nextQuestion
  const q = raw.nextQuestion;
  if (!q || typeof q !== 'object') {
    throw new A1ValidationError('question');
  }
  const qWords = validateWordArray(q.text, 1, 4);
  const qText = qWords.join(' ').trim();

  if (!Array.isArray(q.options) || q.options.length !== 3) {
    throw new A1ValidationError('options');
  }

  const normalizedOptions: Array<{ text: string; tone: 'serious' | 'ironic' }> = [];
  let seriousCount = 0;
  let ironicCount = 0;

  for (const opt of q.options) {
    if (!opt || typeof opt !== 'object') {
      throw new A1ValidationError('options');
    }
    if (opt.tone === 'serious') {
      seriousCount++;
    } else if (opt.tone === 'ironic') {
      ironicCount++;
    } else {
      throw new A1ValidationError('option_tones');
    }
    const optWords = validateWordArray(opt.text, 1, 4);
    const optText = optWords.join(' ').trim();
    normalizedOptions.push({ text: optText, tone: opt.tone });
  }

  if (seriousCount !== 2 || ironicCount !== 1) {
    throw new A1ValidationError('option_tones');
  }

  const uniqueTexts = new Set(normalizedOptions.map(o => o.text));
  if (uniqueTexts.size !== 3) {
    throw new A1ValidationError('option_duplicate');
  }

  verifySentences(openingStr,1);
  verifySentences(contributionStr,3);
  verifySentences(bridgeStr,1);
  return {
    opening: openingStr,
    contribution: contributionStr,
    bridge: bridgeStr,
    comment: {
      kind: comment.kind ?? (start ? 'neutral' : 'correction'),
      text: typeof comment.text === 'string' ? comment.text.trim() : ''
    },
    nextQuestion: {
      text: qText,
      options: normalizedOptions
    }
  };
}
