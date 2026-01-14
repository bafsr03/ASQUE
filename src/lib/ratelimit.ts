import { logger } from './logger';

/**
 * Rate Limiter
 * In-memory sliding window rate limiter with Redis support for production
 */

interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Max requests per window
}

interface RateLimitStore {
    [key: string]: number[]; // key -> array of timestamps
}

class RateLimiter {
    private store: RateLimitStore = {};

    /**
     * Check if request is allowed under rate limit
     * @param key Unique identifier (userId, IP, etc.)
     * @param config Rate limit configuration
     * @returns Object with allowed status and remaining requests
     */
    async check(
        key: string,
        config: RateLimitConfig
    ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
        const now = Date.now();
        const windowStart = now - config.windowMs;

        // Initialize or get existing timestamps for this key
        if (!this.store[key]) {
            this.store[key] = [];
        }

        // Filter out timestamps outside the current window
        this.store[key] = this.store[key].filter((timestamp) => timestamp > windowStart);

        const currentCount = this.store[key].length;
        const allowed = currentCount < config.maxRequests;

        if (allowed) {
            this.store[key].push(now);
        }

        const remaining = Math.max(0, config.maxRequests - currentCount - (allowed ? 1 : 0));
        const resetAt = this.store[key][0] ? this.store[key][0] + config.windowMs : now + config.windowMs;

        return {
            allowed,
            remaining,
            resetAt,
        };
    }

    /**
     * Clear rate limit for a specific key
     */
    async reset(key: string): Promise<void> {
        delete this.store[key];
    }

    /**
     * Clean up old entries (run periodically)
     */
    cleanup(): void {
        const now = Date.now();
        const maxAge = 60 * 60 * 1000; // 1 hour

        for (const key in this.store) {
            this.store[key] = this.store[key].filter((timestamp) => now - timestamp < maxAge);
            if (this.store[key].length === 0) {
                delete this.store[key];
            }
        }
    }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
    AUTH: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 req/min
    SUBSCRIPTION: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 req/min
    QUOTE_CREATE_FREE: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 req/hour
    QUOTE_CREATE_PRO: { windowMs: 60 * 60 * 1000, maxRequests: 60 }, // 60 req/hour
    QUOTE_LIST: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 req/min
    API_DEFAULT: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 req/min
};

/**
 * Check rate limit for a request
 * @param identifier Unique identifier (userId, IP, etc.)
 * @param limitType Type of rate limit to apply
 * @returns Rate limit check result
 */
export async function checkRateLimit(
    identifier: string,
    limitType: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const config = RATE_LIMITS[limitType];
    const result = await rateLimiter.check(identifier, config);

    if (!result.allowed) {
        logger.warn('Rate limit exceeded', {
            identifier,
            limitType,
            resetAt: new Date(result.resetAt).toISOString(),
        });
    }

    return result;
}

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(identifier: string): Promise<void> {
    await rateLimiter.reset(identifier);
}
