/** Clears Kooby conversation keys; does not FLUSHDB (Redis) or affect other keys (memory). */
export async function clearKoobyConversationCache(redis) {
  const prefix = process.env.REDIS_KEY_PREFIX || "kooby:";
  const pattern = `${prefix}conversation:*`;

  let deleted = 0;
  for await (const key of redis.scanIterator({ MATCH: pattern, COUNT: 200 })) {
    await redis.del(key);
    deleted += 1;
  }

  return { deleted, pattern };
}
