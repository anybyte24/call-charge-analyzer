interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests = new Map<string, RequestRecord>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Troppi tentativi. Riprova più tardi.',
      ...config,
    };
  }

  isAllowed(identifier: string): { allowed: boolean; message?: string; resetTime?: number } {
    const now = Date.now();
    const record = this.requests.get(identifier);

    // Clean up expired records
    this.cleanup();

    if (!record || now >= record.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return { allowed: true };
    }

    if (record.count >= this.config.maxRequests) {
      return {
        allowed: false,
        message: this.config.message,
        resetTime: record.resetTime,
      };
    }

    // Increment count
    record.count++;
    return { allowed: true };
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() >= record.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - record.count);
  }

  getResetTime(identifier: string): number | null {
    const record = this.requests.get(identifier);
    if (!record || Date.now() >= record.resetTime) {
      return null;
    }
    return record.resetTime;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now >= record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters
export const exportRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  message: 'Troppi export richiesti. Attendi 1 minuto prima di riprovare.',
});

export const uploadRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 10 * 60 * 1000, // 10 minutes
  message: 'Troppi file caricati. Attendi 10 minuti prima di riprovare.',
});

export const analysisRateLimiter = new RateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
  message: 'Troppe analisi richieste. Attendi 1 minuto prima di riprovare.',
});

// Rate limit decorator for async functions
export const withRateLimit = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  rateLimiter: RateLimiter,
  getIdentifier: (...args: Parameters<T>) => string = () => 'default'
): T => {
  return (async (...args: Parameters<T>) => {
    const identifier = getIdentifier(...args);
    const { allowed, message, resetTime } = rateLimiter.isAllowed(identifier);

    if (!allowed) {
      const error = new Error(message) as Error & { resetTime?: number };
      error.resetTime = resetTime;
      throw error;
    }

    return await fn(...args);
  }) as T;
};