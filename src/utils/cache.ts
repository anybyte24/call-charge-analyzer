interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    };
    
    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cache = new CacheManager();

// Cleanup expired items every 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000);

// Cache utilities for common patterns
export const withCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  const cached = cache.get<T>(key);
  
  if (cached !== null) {
    return Promise.resolve(cached);
  }
  
  return fetcher().then(data => {
    cache.set(key, data, ttl);
    return data;
  });
};

export const invalidateCache = (pattern: string): void => {
  const keys = Array.from(cache.getStats().keys);
  const regex = new RegExp(pattern);
  
  keys.forEach(key => {
    if (regex.test(key)) {
      cache.delete(key);
    }
  });
};