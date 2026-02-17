/**
 * Redis Cache Utilities
 *
 * Provides a simple, type-safe interface for caching data in Upstash Redis.
 *
 * WHEN TO USE:
 * - Authentication/authorization data that needs to be shared across instances
 * - User sessions and temporary user state
 * - External API data (exchange rates, third-party API responses)
 * - Rate limiting counters
 * - Cross-instance coordination and shared state
 *
 * CHARACTERISTICS:
 * - Persistent across deployments
 * - Shared across all deployment instances
 * - Costs money (pay per operation)
 * - Network latency on every operation
 *
 * AVAILABLE FUNCTIONS:
 * - getCache<T>(key): Get cached data
 * - setCache<T>(key, data, ttl): Set cached data with expiration
 * - deleteCache(key): Delete a single cache entry
 * - deleteCachePattern(pattern): Delete multiple keys matching a pattern
 * - hasCache(key): Check if a key exists
 * - incrementCache(key, ttl): Increment a counter (for rate limiting)
 * - getOrSet<T>(key, fetchFn, ttl): Get from cache or fetch and cache (with deduplication)
 *
 * @module redis-cache
 */

import { logger } from '@/utils/logger';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// In-flight request tracking to prevent cache stampede
const inflightRequests = new Map<string, Promise<any>>();

/**
 * Shorten the cache key for logging
 * @example shortKey("user:123:token") → "user:123:...ken"
 */
const shortKey = (key: string, visibleEnd = 3): string => {
  const parts = key.split(':');
  if (parts.length < 3) return key;
  const prefix = parts.slice(0, 2).join(':');
  const last = parts.at(-1) ?? '';
  const suffix = last.slice(-visibleEnd);
  return `${prefix}:...${suffix}`;
};

/**
 * Get cached data from Redis
 * @param key - The cache key
 * @returns The cached data or null if not found
 * @example
 * const user = await getCache<User>("user:123:token");
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      logger.debug(`Cache hit: ${shortKey(key)}`, 'redis');
    }
    return cached;
  } catch (error) {
    logger.error(`Get failed for ${shortKey(key)}: ${error}`, 'redis');
    return null;
  }
}

/**
 * Set cached data in Redis
 * @param key - The cache key
 * @param data - The data to set
 * @param ttl - The time to live in seconds
 * @example
 * await setCache("user:123:token", { id: 123, name: "John" }, 3600);
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttl: number
): Promise<void> {
  try {
    await redis.set(key, data, { ex: ttl });
    logger.debug(`Cache set: ${shortKey(key)} (TTL: ${ttl}s)`, 'redis');
  } catch (error) {
    logger.error(`Set failed for ${shortKey(key)}: ${error}`, 'redis');
  }
}

/**
 * Delete cached data from Redis
 * @param key - The cache key
 * @example
 * await deleteCache("user:123:token");
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
    logger.debug(`Cache deleted: ${shortKey(key)}`, 'redis');
  } catch (error) {
    logger.error(`Delete failed for ${shortKey(key)}: ${error}`, 'redis');
  }
}

/**
 * Delete multiple keys matching a pattern
 * @param pattern - Redis key pattern (e.g., "user:123:*")
 * @example
 * await deleteCachePattern("user:123:*"); // Deletes all keys for user 123
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.debug(
        `Cache deleted: ${keys.length} keys matching ${pattern}`,
        'redis'
      );
    }
  } catch (error) {
    logger.error(`Delete pattern failed for ${pattern}: ${error}`, 'redis');
  }
}

/**
 * Check if a key exists in cache
 * @param key - The cache key
 * @returns true if key exists, false otherwise
 * @example
 * const exists = await hasCache("user:123:session");
 */
export async function hasCache(key: string): Promise<boolean> {
  try {
    return (await redis.exists(key)) === 1;
  } catch (error) {
    logger.error(`Exists check failed for ${shortKey(key)}: ${error}`, 'redis');
    return false;
  }
}

/**
 * Increment a counter, useful for rate limiting
 * @param key - The cache key
 * @param ttl - TTL in seconds (only set on first increment)
 * @returns The new counter value
 * @example
 * const attempts = await incrementCache("ratelimit:user:123", 60);
 * if (attempts > 5) throw new Error("Rate limit exceeded");
 */
export async function incrementCache(
  key: string,
  ttl: number
): Promise<number> {
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, ttl);
    }
    logger.debug(`Counter incremented: ${shortKey(key)} = ${count}`, 'redis');
    return count;
  } catch (error) {
    logger.error(`Increment failed for ${shortKey(key)}: ${error}`, 'redis');
    return 0;
  }
}

/**
 * Get value from cache, or fetch and cache it if missing.
 *
 * Includes request deduplication: if multiple concurrent requests ask for the same key,
 * only one fetch occurs and all requests receive the same result.
 *
 * @param key - Cache key
 * @param fetchFn - Function to fetch data on cache miss
 * @param ttl - Time to live in seconds
 * @returns The cached or freshly fetched data
 *
 * @example
 * const user = await getOrSet(
 *   "user:123",
 *   async () => db.users.findById(123),
 *   3600
 * );
 */
export async function getOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number
): Promise<T> {
  // Check cache first
  const cached = await getCache<T>(key);
  if (cached !== null) return cached;

  // Check for in-flight request
  const inFlight = inflightRequests.get(key);
  if (inFlight) {
    logger.debug(`Waiting for in-flight request: ${shortKey(key)}`, 'redis');
    return inFlight as Promise<T>;
  }

  // Create and track new fetch request
  const fetchPromise = (async () => {
    try {
      logger.debug(`Cache miss, fetching: ${shortKey(key)}`, 'redis');
      const data = await fetchFn();
      await setCache(key, data, ttl);
      return data;
    } finally {
      inflightRequests.delete(key);
    }
  })();

  inflightRequests.set(key, fetchPromise);
  return fetchPromise;
}
