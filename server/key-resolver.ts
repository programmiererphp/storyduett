/**
 * Server-only Gemini API key resolver.
 * Prioritizes non-empty SD_GEMINI_API_KEY, then falls back to GEMINI_API_KEY.
 * If SD_AI_ENABLED is explicitly set to 'false' (case-insensitive), returns undefined (killswitch).
 * Default is enabled.
 * Never import or reference this in client-side code.
 */
export function resolveServerApiKey(env: Record<string, string | undefined> = process.env): string | undefined {
  if (typeof env.SD_AI_ENABLED === 'string' && env.SD_AI_ENABLED.trim().toLowerCase() === 'false') {
    return undefined;
  }
  const custom = env.SD_GEMINI_API_KEY;
  if (typeof custom === 'string' && custom.trim().length > 0) {
    return custom.trim();
  }
  const standard = env.GEMINI_API_KEY;
  if (typeof standard === 'string' && standard.trim().length > 0) {
    return standard.trim();
  }
  return undefined;
}
