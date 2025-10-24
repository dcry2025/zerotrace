// app.module

// Nest js
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// Other packages
import { WinstonModule } from 'nest-winston';

// Modules
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { HttpCacheModule } from './http-cache/http-cache.module';
import { QueueModule } from './queue/queue.module';
import { OwnerModule } from './owner/owner.module';
import { NotesModule } from './notes/notes.module';
import { TelegramModule } from './telegram/telegram.module';
import { MetricsModule } from './metrics/metrics.module';

// Config
import {
  createWinstonConfig,
  RedisConfig,
  SequelizeConfig,
  ThrottlerConfig,
} from './common/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      expandVariables: true,
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createWinstonConfig,
    }), // Winston logs config
    SequelizeModule.forRootAsync(SequelizeConfig), // Sequelize ORM
    ScheduleModule.forRoot(), // Crone jobs
    CacheModule.registerAsync(RedisConfig), // Redis DB
    ThrottlerModule.forRootAsync(ThrottlerConfig), // Rate limiting

    RedisCacheModule,
    HttpCacheModule,
    QueueModule,
    OwnerModule,
    NotesModule,
    TelegramModule,
    MetricsModule,
  ],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [],
})
export class AppModule {}
