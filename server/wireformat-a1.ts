import { StoryError } from './errors';

// Punctuation can surround a word, but cannot join several words in one slot.
const SINGLE_WORD_REGEX = /^[«"“(]*(?:[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:['’\-][\p{L}\p{N}][\p{L}\p{M}\p{N}]*)*|[0-9]{1,2}:[0-9]{2})[.,!?:;»"”)…]*$/u;

export function isSingleItalianWord(item: unknown): item is string {
  return typeof item === 'string' &&
    item.length > 0 &&
    !/\s/.test(item) &&
    /[\p{L}\p{N}]/u.test(item) &&
    SINGLE_WORD_REGEX.test(item);
}

export function validateWordArray(
  arr: unknown,
  minWords: number,
  maxWords: number
): string[] {
  if (!Array.isArray(arr)) {
    throw new StoryError('invalid_response', 502);
  }
  if (arr.length < minWords || arr.length > maxWords) {
    throw new StoryError('invalid_response', 502);
  }
  for (const item of arr) {
    if (!isSingleItalianWord(item)) {
      throw new StoryError('invalid_response', 502);
    }
  }
  if (arr.length > 0) {
    const joined = (arr as string[]).join(' ').trim();
    const words = joined.split(/\s+/).filter(Boolean);
    if (words.length < minWords || words.length > maxWords) {
      throw new StoryError('invalid_response', 502);
    }
  }
  return arr as string[];
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

function sentence(words:string[]):string {
  // A tuple represents one sentence. Prevent hidden additional sentence boundaries.
  if(words.slice(0,-1).some(word=>/[.!?…]/u.test(word)))throw new StoryError('invalid_response',502);
  const text=words.join(' ').trim();
  return /[.!?…][»"”)]*$/u.test(text)?text:text.replace(/[,;:]+$/u,'')+'.';
}

function verifySentences(text:string,maxSentences:number):void {
  const sentences=text.split(/[.!?…]+/u).map(s=>s.trim()).filter(s=>/[\p{L}\p{N}]/u.test(s));
  if(sentences.length>maxSentences||sentences.some(s=>s.split(/\s+/u).filter(word=>/[\p{L}\p{N}]/u.test(word)).length>4))throw new StoryError('invalid_response',502);
}

export function validateAndNormalizeItalianA1(raw: any, start: boolean): NormalizedGeneration {
  if (!raw || typeof raw !== 'object') {
    throw new StoryError('invalid_response', 502);
  }

  // 1. opening
  let openingStr = '';
  if (start) {
    const words = validateWordArray(raw.opening, 1, 4);
    openingStr = sentence(words);
  } else {
    if (!Array.isArray(raw.opening) || raw.opening.length !== 0) {
      throw new StoryError('invalid_response', 502);
    }
  }

  // 2. contribution
  let contributionStr = '';
  if (start) {
    if (!Array.isArray(raw.contribution) || raw.contribution.length !== 0) {
      throw new StoryError('invalid_response', 502);
    }
  } else {
    if (!Array.isArray(raw.contribution) || raw.contribution.length < 1 || raw.contribution.length > 3) {
      throw new StoryError('invalid_response', 502);
    }
    const sentences: string[] = [];
    for (const sentArr of raw.contribution) {
      const sentWords = validateWordArray(sentArr, 1, 4);
      sentences.push(sentence(sentWords));
    }
    contributionStr = sentences.join(' ').trim();
    if (!contributionStr) {
      throw new StoryError('invalid_response', 502);
    }
  }

  // 3. bridge
  let bridgeStr = '';
  if (start) {
    if (!Array.isArray(raw.bridge) || raw.bridge.length !== 0) {
      throw new StoryError('invalid_response', 502);
    }
  } else {
    if (!Array.isArray(raw.bridge) || raw.bridge.length > 4) {
      throw new StoryError('invalid_response', 502);
    }
    if (raw.bridge.length > 0) {
      const bridgeWords = validateWordArray(raw.bridge, 1, 4);
      bridgeStr = sentence(bridgeWords);
    }
  }

  // 4. comment
  const comment = raw.comment;
  if (!comment || typeof comment !== 'object') {
    throw new StoryError('invalid_response', 502);
  }
  if (start) {
    if (typeof comment.text !== 'string' || comment.text.length > 500) {
      throw new StoryError('invalid_response', 502);
    }
  } else {
    if (
      comment.kind !== 'correction' ||
      typeof comment.text !== 'string' ||
      comment.text.trim().length === 0 ||
      comment.text.length > 500
    ) {
      throw new StoryError('invalid_response', 502);
    }
  }

  // 5. nextQuestion
  const q = raw.nextQuestion;
  if (!q || typeof q !== 'object') {
    throw new StoryError('invalid_response', 502);
  }
  const qWords = validateWordArray(q.text, 1, 4);
  const qText = qWords.join(' ').trim();

  if (!Array.isArray(q.options) || q.options.length !== 3) {
    throw new StoryError('invalid_response', 502);
  }

  const normalizedOptions: Array<{ text: string; tone: 'serious' | 'ironic' }> = [];
  let seriousCount = 0;
  let ironicCount = 0;

  for (const opt of q.options) {
    if (!opt || typeof opt !== 'object') {
      throw new StoryError('invalid_response', 502);
    }
    if (opt.tone === 'serious') {
      seriousCount++;
    } else if (opt.tone === 'ironic') {
      ironicCount++;
    } else {
      throw new StoryError('invalid_response', 502);
    }
    const optWords = validateWordArray(opt.text, 1, 4);
    const optText = optWords.join(' ').trim();
    normalizedOptions.push({ text: optText, tone: opt.tone });
  }

  if (seriousCount !== 2 || ironicCount !== 1) {
    throw new StoryError('invalid_response', 502);
  }

  const uniqueTexts = new Set(normalizedOptions.map(o => o.text));
  if (uniqueTexts.size !== 3) {
    throw new StoryError('invalid_response', 502);
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
