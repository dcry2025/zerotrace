/**
 * Telegram Bot Messages Constants
 */
export const TELEGRAM_MESSAGES = {
  // Start command messages
  START_WITH_NOTE: (_noteId: string) =>
    `🔔 *Notification Activated!*\n\n` +
    `Your note is now connected to this chat. You'll receive notifications when someone reads your note.`,

  START_ALREADY_ACTIVATED: (_noteId: string) =>
    `✅ *Already Activated*\n\n` +
    `This note is already connected to your chat.`,

  START_NOTE_NOT_FOUND:
    `❌ *Note Not Found*\n\n` +
    `The note you're trying to activate doesn't exist or has been deleted.`,

  START_NO_LINK:
    `👋 *Welcome to zerotrace Bot!*\n\n` +
    `To activate notifications for your note, use the activation link from your note page.\n\n` +
    `🔗 Example: \`/start YOUR_NOTE_LINK\``,

  // Generic message response
  GENERIC_MESSAGE:
    `ℹ️ *How to Use This Bot*\n\n` +
    `This bot only handles note activation via special links.\n\n` +
    `To activate notifications:\n` +
    `1️⃣ Create a note on the website\n` +
    `2️⃣ Click the Telegram activation link\n` +
    `3️⃣ You'll receive notifications when someone reads your note`,

  // Notification messages
  NOTE_READ_NOTIFICATION: (noteId: string) =>
    `📬 *Your Note Was Read!*\n\n` +
    `📝 Note ID: \`${noteId}\`\n` +
    `⏰ Time: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`,

  NOTE_ACCESS_FAILED: (noteId: string, reason?: string) =>
    `🚨 *Failed Access Attempt!*\n\n` +
    `📝 Note ID: \`${noteId}\`\n` +
    `❌ Reason: ${reason || 'Incorrect password'}\n` +
    `⏰ Time: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC\n\n` +
    `⚠️ Your note is still safe and unread.\n\n` +
    `💡 *Tip:* If you want to delete this note and make it inaccessible to everyone, click the "Delete Note" button below.`,

  // Security messages (HTML format for better compatibility)
  SECURITY_ALERT_UNAUTHORIZED_ACTIVATION: (noteId: string) =>
    `🔒 <b>Security Alert</b>\n\n` +
    `Someone tried to activate notifications for your note!\n\n` +
    `📝 Note ID: <code>${noteId}</code>\n` +
    `⚠️ This might be someone who obtained your activation link. ` +
    `Your note is still secure and only you can manage it.`,

  // Error messages
  ERROR_SENDING_NOTIFICATION: `⚠️ Failed to send notification. Please try activating again.`,
} as const;

/**
 * Telegram Bot Configuration Constants
 */
export const TELEGRAM_CONFIG = {
  PARSE_MODE: 'Markdown' as const,
  DROP_PENDING_UPDATES: true,
} as const;
