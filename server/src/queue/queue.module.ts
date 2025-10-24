// src/queue/queue.module.ts

// Nest js
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

// Queue config
import {
  NOTIFICATIONS_QUEUE_NAME,
  NOTIFICATIONS_QUEUE_OPTIONS,
} from './queues/notifications.queue';

/**
 * Queue Module
 *
 * Configures BullMQ with Redis connection and registers all queues.
 *
 * Currently registered queues:
 * - Notifications queue (Telegram, Email, Push, Webhook)
 *
 * Usage in other modules:
 * 1. Import this module
 * 2. Inject the queue: @InjectQueue(NOTIFICATIONS_QUEUE_NAME)
 * 3. Add jobs: queue.add(NotificationType.TELEGRAM, {...})
 */
@Module({
  imports: [
    // Global BullMQ configuration (Redis connection)
    // ConfigModule is global, no need to import it here
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          username: configService.get<string>('REDIS_USERNAME'),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
          maxRetriesPerRequest: null, // Required for BullMQ
          enableReadyCheck: false,

          // Retry strategy with exponential backoff (1s → 2.7s → 7.4s → 20s max)
          // Recommended by Context7 for production resilience
          retryStrategy: (times: number) => {
            const delay = Math.max(Math.min(Math.exp(times), 20000), 1000);
            console.log(
              `[BullMQ] Redis retry attempt ${times}, waiting ${delay}ms`,
            );
            return delay;
          },
        },
      }),
      inject: [ConfigService],
    }),
    // Register notifications queue
    BullModule.registerQueue({
      name: NOTIFICATIONS_QUEUE_NAME,
      defaultJobOptions: NOTIFICATIONS_QUEUE_OPTIONS,
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
