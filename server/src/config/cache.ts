/**
 * StadiumPulse AI - In-Memory Cache
 *
 * Simulates Redis for development. Provides get/set/del with TTL support.
 *
 * PRODUCTION SCALE NOTE:
 * Replace this with a real Redis client (ioredis) when deploying to production.
 * Redis is needed for:
 * - Cross-instance cache sharing in a multi-server deployment
 * - Pub/Sub for WebSocket scaling (Socket.io Redis adapter)
 * - Atomic crowd counter operations across processes
 */

interface CacheEntry {
  value: string;
  expiresAt: number | null;
}

class InMemoryCache {
  private store: Map<string, CacheEntry> = new Map();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const result: string[] = [];
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        const entry = this.store.get(key);
        if (entry && (!entry.expiresAt || Date.now() <= entry.expiresAt)) {
          result.push(key);
        }
      }
    }
    return result;
  }

  async flush(): Promise<void> {
    this.store.clear();
  }
}

export const cache = new InMemoryCache();
export default cache;
