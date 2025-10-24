// src/queue/types/notification-job.types.ts

/**
 * Notification Job Types
 *
 * Data types for all notification types in the system.
 * Used in NotificationsQueue and processors.
 */

/**
 * Notification types (extensible)
 */
export enum NotificationType {
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  PUSH = 'push',
  WEBHOOK = 'webhook',
}

/**
 * Base interface for all notification jobs
 */
interface BaseNotificationJob {
  type: NotificationType;
  priority?: number; // Higher = more important (default: 0)
}

/**
 * Telegram notification actions
 */
export enum TelegramNotificationAction {
  NOTE_READ = 'note_read',
  NOTE_ACCESS_FAILED = 'note_access_failed',
}

/**
 * Telegram notification job data
 */
export interface TelegramNotificationJob extends BaseNotificationJob {
  type: NotificationType.TELEGRAM;
  action: TelegramNotificationAction;
  chatId: string;
  noteId: string;
  reason?: string; // For access_failed
}

/**
 * Email notification job data (example for future)
 */
export interface EmailNotificationJob extends BaseNotificationJob {
  type: NotificationType.EMAIL;
  action: string;
  to: string;
  subject: string;
  body: string;
}

/**
 * Union type for all notification jobs
 */
export type NotificationJobData =
  | TelegramNotificationJob
  | EmailNotificationJob;
