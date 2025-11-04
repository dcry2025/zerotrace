// src/metrics/metrics.module.ts

/**
 * Metrics Module
 *
 * Provides system metrics endpoint for monitoring:
 * - Server health (uptime, memory, CPU)
 * - Database statistics (notes count, active, etc.)
 * - Queue statistics (waiting, active, completed, failed)
 * - Telegram notifications stats
 *
 * Protected by API key authentication
 */

import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Note } from '../notes/models/note-model';
import { Owner } from '../owner/models/owner-model';
import { BullModule } from '@nestjs/bullmq';
import { NOTIFICATIONS_QUEUE_NAME } from '../queue/queues/notifications.queue';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Note, Owner]),
    BullModule.registerQueue({
      name: NOTIFICATIONS_QUEUE_NAME,
    }),
    RedisCacheModule,
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
