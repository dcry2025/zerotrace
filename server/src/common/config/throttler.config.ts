// src/common/config/throttler.config.ts

import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { ThrottlerRedisStorage } from './throttler-redis.storage';

export const ThrottlerConfig = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (
    configService: ConfigService,
  ): Promise<ThrottlerModuleOptions> => {
    const redisHost = configService.get<string>('REDIS_HOST');
    const redisPort = configService.get<number>('REDIS_PORT') || 6379;
    const redisPassword = configService.get<string>('REDIS_PASSWORD');

    // Create Redis storage if Redis is configured
    let storage = undefined;
    if (redisHost) {
      const redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        // Connection options for reliability
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
      });

      storage = new ThrottlerRedisStorage(redisClient);

      // Log connection status
      redisClient.on('connect', () => {
        console.log('✅ Throttler Redis storage connected');
      });

      redisClient.on('error', (err: Error) => {
        console.error('❌ Throttler Redis storage error:', err.message);
      });
    } else {
      console.warn(
        '⚠️  Redis not configured - using in-memory throttle storage',
      );
    }

    return {
      throttlers: [
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: 10, // 10 requests per second
        },
        {
          name: 'medium',
          ttl: 10000, // 10 seconds
          limit: 50, // 50 requests per 10 seconds
        },
        {
          name: 'long',
          ttl: 60000, // 1 minute
          limit: 200, // 200 requests per minute
        },
      ],
      // Use Redis storage for distributed rate limiting
      storage,
    };
  },
  inject: [ConfigService],
};
