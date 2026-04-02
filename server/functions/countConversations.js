/** Counts Kooby conversation keys (same pattern as clear). Works with Redis or the in-memory client from ../cache.js. */
export async function countKoobyConversations(redis) {
  const prefix = process.env.REDIS_KEY_PREFIX || "kooby:";
  const pattern = `${prefix}conversation:*`;

  let count = 0;
  for await (const _key of redis.scanIterator({ MATCH: pattern, COUNT: 200 })) {
    count += 1;
  }

  return { count, pattern };
}
