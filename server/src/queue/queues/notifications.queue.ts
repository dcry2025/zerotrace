// src/queue/queues/notifications.queue.ts

/**
 * Universal Notifications Queue
 *
 * This queue handles ALL types of notifications:
 * - Telegram messages
 * - Email notifications
 * - SMS messages
 * - Push notifications
 * - Webhooks
 *
 * Each notification type has its own processor.
 */

// Re-export types for convenience
export {
  NotificationType,
  NotificationJobData,
  TelegramNotificationJob,
  TelegramNotificationAction,
  EmailNotificationJob,
} from '../types/notification-job.types';

export const NOTIFICATIONS_QUEUE_NAME = 'notifications';

/**
 * Default job options for notifications queue
 */
export const NOTIFICATIONS_QUEUE_OPTIONS = {
  attempts: 3, // Retry 3 times
  backoff: {
    type: 'exponential' as const,
    delay: 2000, // Start with 2 seconds, then 4s, 8s
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep successful jobs for 24 hours
    count: 1000, // Keep max 1000 completed jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days for debugging
  },
};
