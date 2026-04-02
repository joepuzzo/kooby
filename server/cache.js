/**
 * In-memory store with the same async surface as ioredis used by Kooby:
 * get, set, del, scanIterator({ MATCH, COUNT }).
 * Set `global.myapp.redis` to a real Redis client to use Redis instead.
 */
export function createMemoryConversationCache() {
  const store = new Map();

  function globToRegex(glob) {
    return new RegExp(
      `^${glob
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".")}$`,
    );
  }

  return {
    async get(key) {
      if (!store.has(key)) return null;
      return store.get(key);
    },

    async set(key, value) {
      store.set(key, value);
    },

    async del(key) {
      store.delete(key);
    },

    scanIterator({ MATCH }) {
      const re = globToRegex(MATCH);
      async function* iter() {
        for (const key of store.keys()) {
          if (re.test(key)) yield key;
        }
      }
      return iter();
    },
  };
}

let memorySingleton = null;

/**
 * Redis drop-in: set `global.myapp.redis` to your ioredis client.
 * Otherwise uses a process-local in-memory cache (same method names).
 */
export function getConversationCache() {
  if (global.myapp?.redis) {
    return global.myapp.redis;
  }
  if (!memorySingleton) {
    memorySingleton = createMemoryConversationCache();
  }
  return memorySingleton;
}
