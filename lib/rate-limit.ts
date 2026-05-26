import { chatConfig } from "@/config/chat";

type RateLimitEntry = { count: number; windowStart: number };
const store = new Map<string, RateLimitEntry>();

// cleanup stale entries to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store.entries()) {
    if (now - entry.windowStart > chatConfig.rateLimit.windowMs) {
      store.delete(ip);
    }
  }
}, chatConfig.rateLimit.cleanupIntervalMs);

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > chatConfig.rateLimit.windowMs) {
    store.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= chatConfig.rateLimit.maxRequests) return true;

  entry.count += 1;
  return false;
}
