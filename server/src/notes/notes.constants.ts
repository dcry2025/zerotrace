/**
 * Configuration constants for notes
 */
export const NOTES_CONFIG = {
  // Content validation
  MAX_CONTENT_LENGTH: 50000,
  MAX_PASSWORD_LENGTH: 128,

  // Expiration
  MAX_EXPIRATION_DAYS: 30,
  MIN_EXPIRATION_DAYS: 1,

  // Pagination
  DEFAULT_PAGE_LIMIT: 100,
  MAX_PAGE_LIMIT: 500,
  MIN_PAGE_LIMIT: 1,

  // Cleanup
  OLD_NOTES_CLEANUP_DAYS: 90,
} as const;

/**
 * Error messages for notes operations
 */
export const NOTES_ERRORS = {
  // Content errors
  INVALID_CONTENT_LENGTH: 'Invalid content length',
  CONTENT_EMPTY_AFTER_SANITIZATION:
    'Note content cannot be empty after sanitization',

  // Note not found errors
  NOTE_NOT_FOUND: 'Note not found',
  NOTE_ALREADY_READ:
    'This note has already been read and is no longer available',
  NOTE_EXPIRED: 'This note has expired',

  // Password errors
  PASSWORD_REQUIRED: 'Password required',
  PASSWORD_INCORRECT: 'Incorrect password',

  // Queue errors
  QUEUE_ADD_FAILED: 'Failed to add notification to queue',
} as const;

/**
 * Log messages for notes operations
 */
export const NOTES_LOGS = {
  // Creation
  NOTE_CREATED: (uniqueLink: string, notifyOnRead: boolean) =>
    `Note created with link: ${uniqueLink}${notifyOnRead ? ' (with Telegram notification)' : ''}`,

  // Reading
  NOTE_READ_SUCCESS: (uniqueLink: string, readerInfo: string) =>
    `✅ Note ${uniqueLink} was read successfully. From: ${readerInfo} (kept in database)`,

  NOTE_READ_ATTEMPT: (uniqueLink: string, ipAddress: string) =>
    `Attempt to read already read note: ${uniqueLink} from ${ipAddress || 'unknown IP'}`,

  NOTE_EXPIRED_ATTEMPT: (uniqueLink: string) =>
    `Attempt to read expired note: ${uniqueLink}`,

  // Password attempts
  PASSWORD_NOT_PROVIDED: (uniqueLink: string, readerInfo: string) =>
    `Failed access to note ${uniqueLink}: Password required but not provided. From: ${readerInfo}`,

  PASSWORD_INCORRECT: (uniqueLink: string, readerInfo: string) =>
    `Failed access to note ${uniqueLink}: Incorrect password. From: ${readerInfo}`,

  // Notifications
  NOTIFICATION_QUEUED: (uniqueLink: string, chatId: string, action: string) =>
    `📤 Queueing ${action} notification for note ${uniqueLink} to chat_id ${chatId}`,

  NOTIFICATION_QUEUE_ERROR: (uniqueLink: string) =>
    `Failed to add notification to queue for note ${uniqueLink}`,

  // Statistics
  STATISTICS: (total: number, read: number, unread: number, expired: number) =>
    `Notes Statistics: Total=${total}, Read=${read}, Unread=${unread}, Expired=${expired}`,

  STATISTICS_ERROR: 'Error getting notes statistics',

  // Cleanup
  CLEANUP_SUCCESS: (count: number) =>
    `Cleaned up ${count} notes older than 90 days`,

  CLEANUP_ERROR: 'Error cleaning up old notes',

  // Owner deletion
  OWNER_DELETE_NOT_FOUND: (uniqueLink: string) =>
    `Note ${uniqueLink} not found for owner deletion`,

  OWNER_DELETE_ALREADY_READ: (uniqueLink: string) =>
    `Note ${uniqueLink} is already marked as read`,

  OWNER_DELETE_SUCCESS: (uniqueLink: string) =>
    `✅ Note ${uniqueLink} marked as read by owner (not deleted from database)`,

  // Task
  TASK_NO_EXPIRED: 'No expired notes found to mark as read',
  TASK_SUCCESS: (count: number) => `✅ Marked ${count} expired note(s) as read`,
  TASK_ERROR: 'Error marking expired notes as read',
} as const;

/**
 * Reasons for failed access attempts
 */
export const FAILED_ACCESS_REASONS = {
  PASSWORD_REQUIRED: 'Password required but not provided',
  PASSWORD_INCORRECT: 'Incorrect password',
} as const;
