// src/common/config/redis.config.ts

// Nest js
import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Other packages
import { redisStore } from 'cache-manager-redis-store';

export const RedisConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const redisHost = configService.get<string>('REDIS_HOST');
    const redisPort = configService.get<number>('REDIS_PORT');
    const redisUsername = configService.get<string>('REDIS_USERNAME');
    const redisPassword = configService.get<string>('REDIS_PASSWORD');
    const redisTtl = configService.get<number>('REDIS_TTL');

    const store = await redisStore({
      socket: {
        host: redisHost,
        port: redisPort,
      },
      username: redisUsername,
      password: redisPassword,
      ttl: redisTtl,
    });

    console.log('✅ Redis store created successfully');

    return {
      store: () => store,
    };
  },
  inject: [ConfigService],
};
