export class InMemoryCache {
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(cleanupIntervalMs: number = 10 * 60 * 1000) {
    // Periodic cleanup of expired entries
    this.cleanupTimer = setInterval(() => {
      this.evictExpired();
    }, cleanupIntervalMs);

    if (this.cleanupTimer && this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set(key: string, data: any, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { data, expiresAt });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

export const googleMapsCache = new InMemoryCache();
