export const chatConfig = {
  rateLimit: {
    maxRequests: 20,
    windowMs: 60_000, // 1 minute
    cleanupIntervalMs: 5 * 60_000,
  },
  maxMessages: 20,
  maxMessageLength: 500,
} as const;
