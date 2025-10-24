// src/redis-cache/redis-cache.module.ts

// Nest js
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Other packages
import Redis from 'ioredis';

// Services
import { RedisCacheService } from './redis-cache.service';

// Interceptors
import { RedisCacheInterceptor } from './interceptor/redis-cache.interceptor';

@Module({
  imports: [],
  providers: [
    RedisCacheService,
    RedisCacheInterceptor,
    {
      provide: 'REAL_REDIS',
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get<string>('REDIS_PORT') || '6379', 10),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,

          // Limit retries per request to prevent hanging (recommended for non-BullMQ services)
          maxRetriesPerRequest: 3,

          // Retry strategy with exponential backoff (max 2s delay)
          retryStrategy(times: number) {
            const delay = Math.min(times * 50, 2000);
            console.log(
              `[Redis Cache] Retry attempt ${times}, waiting ${delay}ms`,
            );
            return delay;
          },

          // Enable ready check to ensure Redis is ready before accepting commands
          enableReadyCheck: true,

          // Reconnect on specific errors (e.g., READONLY)
          reconnectOnError(err: Error) {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
              return true;
            }
            return false;
          },
        });

        // Monitor connection lifecycle events
        redis.on('connect', () => {
          console.log('✅ [Redis Cache] Connected');
        });

        redis.on('ready', () => {
          console.log('✅ [Redis Cache] Ready to receive commands');
        });

        redis.on('error', err => {
          console.error('❌ [Redis Cache] Error:', err.message);
        });

        redis.on('close', () => {
          console.log('⚠️ [Redis Cache] Connection closed');
        });

        redis.on('reconnecting', delay => {
          console.log(`🔄 [Redis Cache] Reconnecting in ${delay}ms`);
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisCacheService, RedisCacheInterceptor, 'REAL_REDIS'],
})
export class RedisCacheModule {}
