import { logger } from './logger';

/**
 * Cache Layer
 * In-memory cache with TTL support and Redis fallback for production
 */

interface CacheEntry {
    value: any;
    expiresAt: number;
    tags?: string[];
}

interface CacheStore {
    [key: string]: CacheEntry;
}

class Cache {
    private store: CacheStore = {};

    /**
     * Get value from cache
     * @param key Cache key
     * @returns Cached value or null if not found/expired
     */
    async get<T = any>(key: string): Promise<T | null> {
        const entry = this.store[key];

        if (!entry) {
            logger.debug('Cache MISS', { key });
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            delete this.store[key];
            logger.debug('Cache EXPIRED', { key });
            return null;
        }

        logger.debug('Cache HIT', { key });
        return entry.value as T;
    }

    /**
     * Set value in cache
     * @param key Cache key
     * @param value Value to cache
     * @param ttlSeconds Time to live in seconds
     * @param tags Optional tags for grouped invalidation
     */
    async set(key: string, value: any, ttlSeconds: number, tags?: string[]): Promise<void> {
        this.store[key] = {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
            tags,
        };
        logger.debug('Cache SET', { key, ttlSeconds, tags });
    }

    /**
     * Delete specific key from cache
     * @param key Cache key to delete
     */
    async delete(key: string): Promise<void> {
        delete this.store[key];
        logger.debug('Cache DELETE', { key });
    }

    /**
     * Invalidate all cache entries with a specific tag
     * @param tag Tag to invalidate
     */
    async invalidateTag(tag: string): Promise<void> {
        let count = 0;
        for (const key in this.store) {
            if (this.store[key].tags?.includes(tag)) {
                delete this.store[key];
                count++;
            }
        }
        logger.info('Cache TAG INVALIDATION', { tag, entriesInvalidated: count });
    }

    /**
     * Clear all cache entries
     */
    async clear(): Promise<void> {
        const count = Object.keys(this.store).length;
        this.store = {};
        logger.info('Cache CLEARED', { entriesCleared: count });
    }

    /**
     * Clean up expired entries
     */
    cleanup(): void {
        const now = Date.now();
        let cleaned = 0;

        for (const key in this.store) {
            if (now > this.store[key].expiresAt) {
                delete this.store[key];
                cleaned++;
            }
        }

        if (cleaned > 0) {
            logger.debug('Cache CLEANUP', { entriesRemoved: cleaned });
        }
    }
}

// Singleton instance
const cache = new Cache();

// Cleanup every 2 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => cache.cleanup(), 2 * 60 * 1000);
}

// Cache key generators
export const CacheKeys = {
    userSubscription: (userId: string) => `subscription:${userId}`,
    userSettings: (userId: string) => `settings:${userId}`,
    quoteList: (userId: string) => `quotes:list:${userId}`,
    quote: (quoteId: string) => `quote:${quoteId}`,
    productList: (userId: string) => `products:list:${userId}`,
    clientList: (userId: string) => `clients:list:${userId}`,
};

// Cache tags for grouped invalidation
export const CacheTags = {
    USER: (userId: string) => `user:${userId}`,
    QUOTES: (userId: string) => `quotes:${userId}`,
    PRODUCTS: (userId: string) => `products:${userId}`,
    CLIENTS: (userId: string) => `clients:${userId}`,
    SUBSCRIPTION: (userId: string) => `subscription:${userId}`,
};

// Export cache operations
export const cacheGet = <T = any>(key: string) => cache.get<T>(key);
export const cacheSet = (key: string, value: any, ttlSeconds: number, tags?: string[]) =>
    cache.set(key, value, ttlSeconds, tags);
export const cacheDelete = (key: string) => cache.delete(key);
export const cacheInvalidateTag = (tag: string) => cache.invalidateTag(tag);
export const cacheClear = () => cache.clear();
