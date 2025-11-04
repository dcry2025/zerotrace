// src/common/config/throttler-redis.storage.ts

import { ThrottlerStorage } from '@nestjs/throttler';
import { Redis } from 'ioredis';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';

/**
 * Redis storage for distributed rate limiting
 * Uses ioredis for storing throttle records
 */
export class ThrottlerRedisStorage implements ThrottlerStorage {
  constructor(private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    _throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const blockKey = `${key}:block`;
    const ttlSeconds = Math.ceil(ttl / 1000);
    const blockDurationSeconds = Math.ceil(blockDuration / 1000);

    // Check if currently blocked
    const blockedUntil = await this.redis.get(blockKey);
    if (blockedUntil) {
      const timeToBlockExpire = parseInt(blockedUntil) - Date.now();
      if (timeToBlockExpire > 0) {
        return {
          totalHits: limit + 1,
          timeToExpire: ttl,
          isBlocked: true,
          timeToBlockExpire,
        };
      }
    }

    // Increment the counter
    const totalHits = await this.redis.incr(key);

    // Set expiry on first request
    if (totalHits === 1) {
      await this.redis.expire(key, ttlSeconds);
    }

    // Get remaining TTL
    const ttlRemaining = await this.redis.pttl(key);
    const timeToExpire = ttlRemaining > 0 ? ttlRemaining : ttl;

    // Check if limit exceeded
    if (totalHits > limit) {
      // Set block duration
      const blockUntil = Date.now() + blockDuration;
      await this.redis.setex(
        blockKey,
        blockDurationSeconds,
        blockUntil.toString(),
      );

      return {
        totalHits,
        timeToExpire,
        isBlocked: true,
        timeToBlockExpire: blockDuration,
      };
    }

    return {
      totalHits,
      timeToExpire,
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key);
    await this.redis.del(`${key}:block`);
  }
}
