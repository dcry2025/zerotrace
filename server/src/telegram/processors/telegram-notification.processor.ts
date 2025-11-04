// src/telegram/processors/telegram-notification.processor.ts

// Nest js
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

// Services
import { TelegramService } from '../telegram.service';

// Queue
import { NOTIFICATIONS_QUEUE_NAME } from '../../queue/queues/notifications.queue';
import {
  NotificationJobData,
  NotificationType,
  TelegramNotificationJob,
  TelegramNotificationAction,
} from '../../queue/types/notification-job.types';

/**
 * Telegram Notifications Processor
 *
 * Processes only Telegram notification jobs from the universal notifications queue.
 * Other notification types (Email, SMS) are ignored by this processor.
 *
 * Features:
 * - Automatic retries on failure (configured in queue module)
 * - Dead Letter Queue for permanently failed jobs
 * - Detailed logging for monitoring
 * - Type-safe job processing
 */
@Processor(NOTIFICATIONS_QUEUE_NAME)
export class TelegramNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(TelegramNotificationProcessor.name);

  constructor(private readonly telegramService: TelegramService) {
    super();
  }

  /**
   * Process notification jobs - only handle Telegram type
   */
  async process(job: Job<NotificationJobData>): Promise<void> {
    const { data } = job;

    // Only process Telegram notifications
    if (data.type !== NotificationType.TELEGRAM) {
      // Skip other notification types (handled by other processors)
      return;
    }

    const telegramJob = data as TelegramNotificationJob;

    this.logger.log(
      `Processing Telegram job ${job.id} (attempt ${job.attemptsMade + 1}/${job.opts.attempts}): ${telegramJob.action}`,
    );

    try {
      let success = false;

      switch (telegramJob.action) {
        case TelegramNotificationAction.NOTE_READ:
          success = await this.telegramService.sendNoteReadNotification(
            telegramJob.chatId,
            telegramJob.noteId,
          );
          break;

        case TelegramNotificationAction.NOTE_ACCESS_FAILED:
          success = await this.telegramService.sendNoteAccessFailedNotification(
            telegramJob.chatId,
            telegramJob.noteId,
            telegramJob.reason,
          );
          break;

        default:
          throw new Error(
            `Unknown Telegram action: ${(telegramJob as any).action}`,
          );
      }

      if (!success) {
        throw new Error('Telegram service returned false');
      }

      this.logger.log(
        `✅ Successfully processed Telegram job ${job.id}: ${telegramJob.action} for note ${telegramJob.noteId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to process Telegram job ${job.id} (attempt ${job.attemptsMade + 1}): ${error.message}`,
        error.stack,
      );

      // Re-throw to trigger retry mechanism
      throw error;
    }
  }

  /**
   * Called when job completes successfully
   */
  async onCompleted(job: Job<NotificationJobData>) {
    if (job.data.type === NotificationType.TELEGRAM) {
      this.logger.log(
        `🎉 Telegram job ${job.id} completed successfully after ${job.attemptsMade + 1} attempt(s)`,
      );
    }
  }

  /**
   * Called when job fails after all retries
   */
  async onFailed(job: Job<NotificationJobData>, error: Error) {
    if (job.data.type === NotificationType.TELEGRAM) {
      this.logger.error(
        `🔴 Telegram job ${job.id} failed permanently after ${job.attemptsMade} attempts: ${error.message}`,
      );
      this.logger.error(`Job data: ${JSON.stringify(job.data)}`);

      // TODO: Consider sending alert to admin (email, Slack, etc.)
      // or storing in a separate database table for manual review
    }
  }

  /**
   * Called when job is moved to active state
   */
  async onActive(job: Job<NotificationJobData>) {
    if (job.data.type === NotificationType.TELEGRAM) {
      this.logger.log(
        `🔄 Telegram job ${job.id} is now active (attempt ${job.attemptsMade + 1})`,
      );
    }
  }
}
