// src/cache/cache.service.ts

// Nest js
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// Other packages
import { Cache } from 'cache-manager';
import Redis from 'ioredis';

/**
 * RedisCacheService provides access to the same Redis instance via two layers:
 *
 * 1. cacheManager — high-level interface using @nestjs/cache-manager
 *    for generic get/set/del operations with Redis as a backend.
 *
 * 2. redis — low-level native Redis client (ioredis),
 *    enabling access to Redis commands like lpush, zrange, hset, etc.
 *
 * Both are connected to the same Redis instance,
 * but serve different architectural purposes.
 */
@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('REAL_REDIS') private readonly redis: Redis,
  ) {}

  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Store a binary buffer in Redis by encoding it to base64.
   * Useful for caching images or files.
   * @param key - Redis key
   * @param buffer - Buffer to store
   * @param ttl - Time to live in seconds
   */
  async setBuffer(key: string, buffer: Buffer, ttl: number): Promise<void> {
    await this.redis.set(key, buffer.toString('base64'), 'EX', ttl);
  }

  /**
   * Retrieve a buffer that was stored as base64-encoded string in Redis.
   * @param key - Redis key
   * @returns The original Buffer or null if key is not found
   */
  async getBuffer(key: string): Promise<Buffer | null> {
    const base64 = await this.redis.get(key);
    return base64 ? Buffer.from(base64, 'base64') : null;
  }

  /**
   * Push a string value to the beginning of a Redis list.
   * @param key - Redis list key
   * @param value - Value to push
   * @returns The new length of the list
   */
  async lpush(key: string, value: string) {
    return this.redis.lpush(key, value);
  }

  /**
   * Set expiration (TTL) on Redis list of photo IDs for a given user.
   * @param key - Redis list key
   * @param ttl - Time to live in seconds
   */
  async expire(key: string, ttl: number): Promise<void> {
    await this.redis.expire(key, ttl);
  }

  /**
   * Get a range of elements from a Redis list.
   * @param key - Redis list key
   * @param start - Start index (default: 0)
   * @param stop - Stop index (default: -1 = end of list)
   * @returns Array of strings from the list
   */
  async lrange(key: string, start = 0, stop = -1) {
    return this.redis.lrange(key, start, stop);
  }

  /**
   * Remove occurrences of a specific value from a Redis list.
   * @param key - Redis list key
   * @param count - Number of occurrences to remove:
   *                0 = all, >0 = from head, <0 = from tail
   * @param value - Value to remove
   * @returns Number of removed items
   */
  async lrem(key: string, count: number, value: string): Promise<number> {
    return this.redis.lrem(key, count, value);
  }

  /**
   * Delete a Redis list by key
   * @param key - Redis list key
   * @returns Number of removed keys (0 or 1)
   */
  async ldel(key: string): Promise<number> {
    return this.redis.del(key);
  }

  /**
   * Removes all Redis keys related to the user's photo uploads.
   *
   * This includes:
   * - photo:{userId}:*       → photo buffers
   * - filetype:{userId}:*    → file MIME enums
   * - photo:{userId}:list    → the Redis list of photo IDs
   *
   * Uses SCAN for non-blocking iteration and safe deletion.
   *
   * @param {number} userId - The ID of the user whose cached photo data should be removed.
   * @returns {Promise<number>} - The number of Redis keys successfully deleted.
   */
  async cleanupUserPhotoCache(userId: number) {
    let deleted = 0;

    const patterns = [`photo:${userId}:*`, `filetype:${userId}:*`];
    for (const pattern of patterns) {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = nextCursor;

        if (keys.length) {
          await this.redis.del(...keys);
          deleted += keys.length;
        }
      } while (cursor !== '0');
    }

    if (await this.redis.del(`photo:${userId}:list`)) {
      deleted++;
    }

    return deleted;
  }

  /**
   * Generates a standardized Redis cache key for a specific user and URL.
   * @param {number} userId - The ID of the user the cache entry belongs to.
   * @param {string} url - The URL or route to be cached (e.g., '/chat').
   * @returns {string} A unique and encoded cache key in the format: `cache:module:user_{userId}_{encodedUrl}`
   *
   * @example
   * generateCacheKey(9, '/chat'); // returns 'cache:module:user_9_%2Fchat'
   **/
  generateCacheKey(userId: number, url: string): string {
    const encodedUrl = encodeURIComponent(url);
    return `cache:module:user_${userId}_${encodedUrl}`;
  }
}
