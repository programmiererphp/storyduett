export const KNOWN_ERROR_INFO_REASONS = [
  'API_KEY_INVALID',
  'API_KEY_SERVICE_BLOCKED',
  'API_KEY_ANDROID_APP_BLOCKED',
  'API_KEY_HTTP_REFERRER_BLOCKED',
  'API_KEY_IP_ADDRESS_BLOCKED',
  'API_KEY_IOS_APP_BLOCKED',
  'API_KEY_EXPIRED',
  'API_KEY_NOT_FOUND',
  'SERVICE_DISABLED',
  'ACCESS_TOKEN_EXPIRED',
  'ACCESS_TOKEN_SCOPE_INSUFFICIENT',
  'RATE_LIMIT_EXCEEDED',
  'USER_PROJECT_DENIED',
  'CONSUMER_INVALID',
  'BILLING_DISABLED'
] as const;

export type KnownErrorInfoReason = typeof KNOWN_ERROR_INFO_REASONS[number];

export function parseKnownErrorInfoReason(e: unknown): KnownErrorInfoReason | null {
  try {
    const raw = e instanceof Error ? e.message : typeof e === 'string' ? e : typeof (e as any)?.message === 'string' ? (e as any).message : '';
    let parsed: any = null;
    const start = raw.indexOf('{'), end = raw.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try { parsed = JSON.parse(raw.slice(start, end + 1)); } catch {}
    }
    const details = Array.isArray(parsed?.error?.details) ? parsed.error.details : Array.isArray((e as any)?.details) ? (e as any).details : [];
    for (const d of details) {
      if (typeof d?.reason === 'string' && (KNOWN_ERROR_INFO_REASONS as readonly string[]).includes(d.reason)) {
        return d.reason as KnownErrorInfoReason;
      }
    }
  } catch {}
  return null;
}

export class StoryError extends Error {
  constructor(
    public code: string,
    public status = 400,
    public errorInfoReason: KnownErrorInfoReason | null = null
  ) {
    super(code);
  }
}
