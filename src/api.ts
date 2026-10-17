/** Same-origin public GET with a bounded wait; no provider credentials. */
export async function fetchJson<T>(url: string, timeoutMs = 10_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error('http');
    return await response.json() as T;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('timeout');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
