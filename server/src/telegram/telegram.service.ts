// src/telegram/telegram.service.ts

// Nest js
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Grammy
import { Bot, InlineKeyboard } from 'grammy';

// Services
import { OwnerService } from '../owner/owner.service';
import { NotesService } from '../notes/notes.service';

// Constants
import { TELEGRAM_MESSAGES, TELEGRAM_CONFIG } from './telegram.constants';

@Injectable()
export class TelegramService implements OnModuleInit, OnApplicationBootstrap {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Bot;
  private isInitialized = false;
  // Store username -> chat_id mapping in memory
  private userMapping: Map<string, string> = new Map();

  constructor(
    private configService: ConfigService,
    private ownerService: OwnerService,
    private notesService: NotesService,
  ) {}

  async onModuleInit() {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    this.logger.log(
      `TELEGRAM_BOT_TOKEN loaded: ${botToken ? 'YES (length: ' + botToken.length + ')' : 'NO'}`,
    );

    if (!botToken) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN not found in environment variables. Telegram notifications will be disabled.',
      );
      return;
    }

    try {
      this.bot = new Bot(botToken);

      // Set up basic commands
      this.bot.command('start', async ctx => {
        const chatId = ctx.chat.id.toString();
        const username = ctx.from?.username;
        const startPayload = ctx.match; // Get parameter from /start PARAMETER (uniqueLink)

        let noteLinked = false;
        let noteId = '';
        let isFirstTimeActivation = false;

        // PRIMARY: Link note with Owner when user activates bot
        if (startPayload && typeof startPayload === 'string') {
          const uniqueLink = startPayload.trim().toLowerCase();
          if (uniqueLink) {
            try {
              // Use NotesService to find note with owner
              const note =
                await this.notesService.findNoteWithOwner(uniqueLink);

              if (note) {
                // Check if notifications are already activated for this note
                if (note.ownerId && note.owner) {
                  // Verify that the current user is the owner
                  if (note.owner.telegramChatId === chatId) {
                    // Same user - already activated
                    this.logger.log(
                      `Note ${uniqueLink} already has notifications activated for this user`,
                    );
                    noteLinked = true;
                    noteId = uniqueLink;
                    isFirstTimeActivation = false;
                  } else {
                    // Different user - security breach attempt!
                    this.logger.warn(
                      `⚠️ Security: User with chat_id ${chatId} attempted to access note ${uniqueLink} owned by chat_id ${note.owner.telegramChatId}`,
                    );
                    
                    // Send security alert to the owner
                    try {
                      await this.bot.api.sendMessage(
                        note.owner.telegramChatId,
                        TELEGRAM_MESSAGES.SECURITY_ALERT_UNAUTHORIZED_ACTIVATION(
                          uniqueLink,
                        ),
                        { parse_mode: 'HTML' }
                      );
                      this.logger.log(
                        `📧 Security alert sent to owner ${note.owner.telegramChatId} about unauthorized activation attempt by ${username ? `@${username}` : 'unknown user'}`
                      );
                    } catch (error) {
                      this.logger.error(
                        `Failed to send security alert to owner ${note.owner.telegramChatId}:`,
                        error.message
                      );
                    }
                    
                    // Don't reveal note existence to unauthorized users
                    noteLinked = false;
                  }
                } else {
                  // First time activation - create/find Owner and link to note
                  const owner =
                    await this.ownerService.findOrCreateByTelegramChatId(
                      chatId,
                      username,
                    );

                  // Use NotesService to link note to owner
                  const linked = await this.notesService.linkNoteToOwner(
                    uniqueLink,
                    owner.id,
                  );

                  if (linked) {
                    noteLinked = true;
                    noteId = uniqueLink;
                    isFirstTimeActivation = true;
                  }
                }
              } else {
                this.logger.warn(`Note ${uniqueLink} not found in database`);
              }
            } catch (error) {
              this.logger.error(
                `Failed to link note ${uniqueLink} with Owner:`,
                error,
              );
            }
          }
        }

        // SECONDARY: Also save username mapping (for backwards compatibility)
        if (username) {
          this.userMapping.set(username.toLowerCase(), chatId);
          this.logger.log(
            `Registered user @${username} with chat_id: ${chatId}`,
          );
        }

        // Send confirmation message
        if (noteLinked) {
          this.logger.log(
            `Sending message for note ${noteId}, isFirstTimeActivation: ${isFirstTimeActivation}`,
          );

          if (isFirstTimeActivation) {
            // First time activation
            this.logger.log(
              `Sending ACTIVATION_SUCCESS message for note ${noteId}`,
            );
            ctx.reply(TELEGRAM_MESSAGES.START_WITH_NOTE(noteId), {
              parse_mode: TELEGRAM_CONFIG.PARSE_MODE,
            });
          } else {
            // Repeat visit - show status only
            this.logger.log(
              `Sending ALREADY_ACTIVE message for note ${noteId}`,
            );
            ctx.reply(TELEGRAM_MESSAGES.START_ALREADY_ACTIVATED(noteId), {
              parse_mode: TELEGRAM_CONFIG.PARSE_MODE,
            });
          }
        } else if (startPayload) {
          // Note not found or unauthorized access attempt
          // Don't reveal if note exists - always show "not found" for security
          ctx.reply(TELEGRAM_MESSAGES.START_NOTE_NOT_FOUND, {
            parse_mode: TELEGRAM_CONFIG.PARSE_MODE,
          });
        } else {
          // No note ID provided - general welcome
          ctx.reply(TELEGRAM_MESSAGES.START_NO_LINK, {
            parse_mode: TELEGRAM_CONFIG.PARSE_MODE,
          });
        }
      });

      // Handle callback query for note deletion (mark as read)
      this.bot.callbackQuery(/^delete_note_(.+)$/, async ctx => {
        const uniqueLink = ctx.match[1];
        const userChatId = ctx.from.id.toString();

        try {
          // Use NotesService to verify ownership
          const note = await this.notesService.verifyNoteOwnership(
            uniqueLink,
            userChatId,
          );

          if (!note) {
            await ctx.answerCallbackQuery({
              text: '❌ Note not found or already deleted',
              show_alert: true,
            });
            return;
          }

          // Check if already marked as read
          if (note.isRead) {
            await ctx.answerCallbackQuery({
              text: '⚠️ Note is already deleted',
              show_alert: true,
            });
            // Update the message to reflect this
            await ctx.editMessageText(
              `🗑️ *Note Deleted*\n\n` +
                `📝 Note ID: \`${uniqueLink}\`\n` +
                `✅ This note has been deleted and is no longer accessible.`,
              { parse_mode: TELEGRAM_CONFIG.PARSE_MODE },
            );
            return;
          }

          // Use NotesService to mark note as read (proper separation of concerns)
          const success =
            await this.notesService.markNoteAsReadByOwner(uniqueLink);

          if (success) {
            this.logger.log(
              `✅ Note ${uniqueLink} marked as read by owner via Telegram button`,
            );

            // Update the message
            await ctx.editMessageText(
              `🗑️ *Note Deleted*\n\n` +
                `📝 Note ID: \`${uniqueLink}\`\n` +
                `✅ Your note has been deleted and is no longer accessible to anyone.`,
              { parse_mode: TELEGRAM_CONFIG.PARSE_MODE },
            );

            await ctx.answerCallbackQuery({
              text: '✅ Note deleted successfully',
            });
          } else {
            await ctx.answerCallbackQuery({
              text: '❌ Failed to delete note',
              show_alert: true,
            });
          }
        } catch (error) {
          this.logger.error(
            `Failed to delete note ${uniqueLink}:`,
            error.message,
          );
          await ctx.answerCallbackQuery({
            text: '❌ Failed to delete note',
            show_alert: true,
          });
        }
      });

      // Handle all other callback queries
      this.bot.on('callback_query:data', async ctx => {
        this.logger.log(`Unknown callback query: ${ctx.callbackQuery.data}`);
        await ctx.answerCallbackQuery(); // Remove loading animation
      });

      // Handle all other messages (including /help, /chatid, etc.)
      this.bot.on('message', ctx => {
        // Only respond to /start command, ignore everything else
        if (!ctx.message?.text?.startsWith('/start')) {
          return; // Silent ignore
        }
      });

      this.isInitialized = true;
      this.logger.log('Telegram bot initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Telegram bot:', error);
    }
  }

  /**
   * Called after all modules are initialized
   * Automatically starts bot polling if initialized
   */
  onApplicationBootstrap() {
    if (this.isInitialized && this.bot) {
      this.logger.log(
        'Application bootstrap complete. Starting Telegram bot polling...',
      );
      this.startPolling();
    } else {
      this.logger.warn(
        'Telegram bot not ready at application bootstrap. Polling will not start.',
      );
    }
  }

  /**
   * Send notification when a note is read
   * @param chatId - Telegram chat ID from Owner
   * @param noteId - Note unique link for display purposes
   */
  async sendNoteReadNotification(
    chatId: string,
    noteId: string,
  ): Promise<boolean> {
    if (!this.isInitialized || !this.bot) {
      this.logger.warn(
        'Telegram bot not initialized. Cannot send notification.',
      );
      return false;
    }

    if (!chatId) {
      this.logger.warn(
        `No chat_id provided for note ${noteId}. User needs to activate bot via deep link first.`,
      );
      return false;
    }

    try {
      const message = TELEGRAM_MESSAGES.NOTE_READ_NOTIFICATION(noteId);

      await this.bot.api.sendMessage(chatId, message, {
        parse_mode: TELEGRAM_CONFIG.PARSE_MODE,
      });

      this.logger.log(
        `✅ Notification sent to chat_id ${chatId} for note ${noteId}`,
      );
      
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Failed to send notification for note ${noteId}:`,
        error.message,
      );
      
      return false;
    }
  }

  /**
   * Send notification when someone fails to access a note (wrong password, etc.)
   * @param chatId - Telegram chat ID from Owner
   * @param noteId - Note unique link for display purposes
   * @param reason - Reason for failed access
   */
  async sendNoteAccessFailedNotification(
    chatId: string,
    noteId: string,
    reason?: string,
  ): Promise<boolean> {
    if (!this.isInitialized || !this.bot) {
      this.logger.warn(
        'Telegram bot not initialized. Cannot send notification.',
      );
      return false;
    }

    if (!chatId) {
      this.logger.warn(
        `No chat_id provided for note ${noteId}. User needs to activate bot via deep link first.`,
      );
      return false;
    }

    try {
      const message = TELEGRAM_MESSAGES.NOTE_ACCESS_FAILED(noteId, reason);

      // Create inline keyboard with delete button
      const keyboard = new InlineKeyboard().text(
        '🗑️ Delete Note',
        `delete_note_${noteId}`,
      );

      await this.bot.api.sendMessage(chatId, message, {
        parse_mode: TELEGRAM_CONFIG.PARSE_MODE,
        reply_markup: keyboard,
      });

      this.logger.log(
        `✅ Failed access notification sent to chat_id ${chatId} for note ${noteId} (Reason: ${reason})`,
      );
      
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Failed to send access failed notification for note ${noteId}:`,
        error.message,
      );
      
      return false;
    }
  }

  /**
   * Get the bot instance for webhook handling
   */
  getBot(): Bot {
    return this.bot;
  }

  /**
   * Check if bot is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get bot information (username and link)
   * @param startParameter - Optional parameter to add to deep link (e.g., telegram username)
   */
  async getBotInfo(
    startParameter?: string,
  ): Promise<{ username: string; link: string } | null> {
    if (!this.isInitialized || !this.bot) {
      return null;
    }

    try {
      const botInfo = await this.bot.api.getMe();
      const baseLink = `https://t.me/${botInfo.username}`;

      // Add start parameter for deep linking if provided
      const link = startParameter
        ? `${baseLink}?start=${encodeURIComponent(startParameter)}`
        : baseLink;

      return {
        username: botInfo.username || '',
        link,
      };
    } catch (error) {
      this.logger.error('Failed to get bot info:', error);
      return null;
    }
  }

  /**
   * Set webhook URL for the bot
   */
  async setWebhook(webhookUrl: string): Promise<boolean> {
    if (!this.isInitialized || !this.bot) {
      this.logger.warn('Telegram bot not initialized. Cannot set webhook.');
      return false;
    }

    try {
      await this.bot.api.setWebhook(webhookUrl);
      this.logger.log(`Webhook set to: ${webhookUrl}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to set webhook:', error);
      return false;
    }
  }

  /**
   * Start bot in polling mode (for development)
   */
  startPolling(): void {
    if (!this.isInitialized || !this.bot) {
      this.logger.warn('Telegram bot not initialized. Cannot start polling.');
      return;
    }

    try {
      this.logger.log('Starting Telegram bot in polling mode...');
      // Start bot in background (non-blocking)
      this.bot
        .start({
          drop_pending_updates: TELEGRAM_CONFIG.DROP_PENDING_UPDATES,
          onStart: () => {
            this.logger.log('✅ Telegram bot polling started successfully');
          },
        })
        .catch(error => {
          this.logger.error('Bot polling error:', error);
        });
      this.logger.log('Telegram bot polling initiated');
    } catch (error) {
      this.logger.error('Failed to start bot polling:', error);
    }
  }

  /**
   * Stop the bot
   */
  async stop(): Promise<void> {
    if (this.bot) {
      await this.bot.stop();
      this.logger.log('Telegram bot stopped');
    }
  }
}
