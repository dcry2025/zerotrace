// src/notes/notes.service.ts

// Nest js
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';

// Other packages
import { v4 as uuidv4 } from 'uuid';
import { Queue } from 'bullmq';
import { Op } from 'sequelize';

// Models
import { Note } from './models/note-model';
import { Owner } from '../owner/models/owner-model';

// Dto
import { CreateNoteDto } from './dto/create-note.dto';
import { ReadNoteDto } from './dto/read-note.dto';
import {
  CreateNoteResponseDto,
  ReadNoteResponseDto,
  NoteStatusResponseDto,
} from './dto/note-response.dto';

// Queue
import { NOTIFICATIONS_QUEUE_NAME } from '../queue/queues/notifications.queue';
import {
  NotificationJobData,
  NotificationType,
  TelegramNotificationAction,
} from '../queue/types/notification-job.types';

// Utils
import {
  validateContentLength,
  sanitizeUserAgent,
  sanitizeIpAddress,
} from '../common/utils/sanitizer.util';

// Constants
import {
  NOTES_CONFIG,
  NOTES_ERRORS,
  NOTES_LOGS,
  FAILED_ACCESS_REASONS,
} from './notes.constants';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    @InjectModel(Note)
    private noteModel: typeof Note,
    @InjectQueue(NOTIFICATIONS_QUEUE_NAME)
    private notificationsQueue: Queue<NotificationJobData>,
  ) {}

  /**
   * Create a new note
   */
  async createNote(
    createNoteDto: CreateNoteDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<CreateNoteResponseDto> {
    const {
      content,
      encryptedKeyForAdmin,
      password,
      expiresInDays,
      notifyOnRead,
    } = createNoteDto;

    // Validate content length (but don't sanitize - content is already encrypted!)
    if (!validateContentLength(content)) {
      throw new Error(NOTES_ERRORS.INVALID_CONTENT_LENGTH);
    }

    // Basic validation - ensure content is not empty
    if (!content || content.trim().length === 0) {
      throw new Error(NOTES_ERRORS.CONTENT_EMPTY_AFTER_SANITIZATION);
    }

    // IMPORTANT: Content is encrypted JSON from client - DO NOT SANITIZE OR MODIFY!
    // The client encrypts with AES-256-GCM including AAD (Additional Authenticated Data).
    // Any modification to the encrypted content will cause AAD verification to fail during decryption.
    // XSS protection is handled on the client side (before encryption and after decryption).

    // Generate unique link and delete link
    const uniqueLink = this.generateUniqueLink();
    const deleteLink = this.generateDeleteLink();

    // Calculate expiration date
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Create note - password will be auto-hashed by model hook using argon2
    const note = await this.noteModel.create({
      content: content, // Store encrypted content AS-IS (already encrypted on client)
      encryptedKeyForAdmin: encryptedKeyForAdmin || null, // Encrypted noteKey for admin
      uniqueLink,
      deleteLink,
      readAt: null, // Note starts as unread
      password: password || null, // Pass plaintext - model will hash it with argon2
      expiresAt,
      ipAddress,
      notifyOnRead: notifyOnRead || false,
      ownerId: null, // Will be set when user activates Telegram bot
    });

    this.logger.log(NOTES_LOGS.NOTE_CREATED(uniqueLink, notifyOnRead || false));

    // Note created - metrics removed for MVP

    return {
      uniqueLink,
      deleteLink,
      message: 'Note created successfully. It can only be read once.',
    };
  }

  /**
   * Read a note by unique link
   * Note: The note is NOT deleted from database, only marked as read
   */
  async readNote(
    uniqueLink: string,
    readNoteDto: ReadNoteDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ReadNoteResponseDto> {
    const startTime = Date.now();
    const note = await this.noteModel.findOne({
      where: {
        uniqueLink,
        deletedAt: null,
      },
      include: [
        {
          model: Owner,
          as: 'owner',
          required: false,
        },
      ],
    });

    if (!note) {
      throw new NotFoundException(NOTES_ERRORS.NOTE_NOT_FOUND);
    }

    // Check if already read - prevent second reading
    if (note.isRead) {
      this.logger.warn(NOTES_LOGS.NOTE_READ_ATTEMPT(uniqueLink, ipAddress));
      throw new NotFoundException(NOTES_ERRORS.NOTE_ALREADY_READ);
    }

    // Check expiration
    if (note.expiresAt && new Date() > note.expiresAt) {
      this.logger.warn(NOTES_LOGS.NOTE_EXPIRED_ATTEMPT(uniqueLink));
      throw new NotFoundException(NOTES_ERRORS.NOTE_EXPIRED);
    }

    // Prepare reader information (for server logs only)
    const sanitizedIp = sanitizeIpAddress(ipAddress);
    const sanitizedUserAgent = sanitizeUserAgent(userAgent);

    let readerInfoLog = '';
    if (
      sanitizedIp &&
      sanitizedIp !== 'Unknown' &&
      sanitizedIp !== 'Invalid IP'
    ) {
      readerInfoLog = `IP: ${sanitizedIp}`;
    }
    if (sanitizedUserAgent && sanitizedUserAgent !== 'Unknown') {
      const browserInfo = this.extractBrowserInfo(sanitizedUserAgent);
      readerInfoLog += readerInfoLog ? ` | ${browserInfo}` : browserInfo;
    }
    if (!readerInfoLog) {
      readerInfoLog = 'Unknown location';
    }

    // Check password using argon2 verification
    if (note.passwordHash) {
      if (!readNoteDto.password) {
        // Log failed access attempt (with IP info)
        this.logger.warn(
          NOTES_LOGS.PASSWORD_NOT_PROVIDED(uniqueLink, readerInfoLog),
        );

        // Password required error

        // Send notification about failed access attempt (without IP info)
        if (note.notifyOnRead && note.owner) {
          await this.enqueueNotification(
            TelegramNotificationAction.NOTE_ACCESS_FAILED,
            note.owner.telegramChatId,
            uniqueLink,
            FAILED_ACCESS_REASONS.PASSWORD_REQUIRED,
          );
        }
        throw new UnauthorizedException(NOTES_ERRORS.PASSWORD_REQUIRED);
      }

      const isPasswordValid = await note.verifyPassword(readNoteDto.password);
      if (!isPasswordValid) {
        // Log failed access attempt with wrong password (with IP info)
        this.logger.warn(
          NOTES_LOGS.PASSWORD_INCORRECT(uniqueLink, readerInfoLog),
        );

        // Password incorrect error

        // Send notification about failed access attempt with wrong password (without IP info)
        if (note.notifyOnRead && note.owner) {
          await this.enqueueNotification(
            TelegramNotificationAction.NOTE_ACCESS_FAILED,
            note.owner.telegramChatId,
            uniqueLink,
            FAILED_ACCESS_REASONS.PASSWORD_INCORRECT,
          );
        }
        throw new UnauthorizedException(NOTES_ERRORS.PASSWORD_INCORRECT);
      }
    }

    // Mark as read by setting read timestamp (but keep in database)
    note.readAt = new Date();
    await note.save();

    // Log successful read (with IP info for server logs)
    this.logger.log(NOTES_LOGS.NOTE_READ_SUCCESS(uniqueLink, readerInfoLog));

    // Send Telegram notification if enabled (successful read, without IP info)
    if (note.notifyOnRead && note.owner) {
      await this.enqueueNotification(
        TelegramNotificationAction.NOTE_READ,
        note.owner.telegramChatId,
        uniqueLink,
      );
    }

    // Note read successfully - metrics removed for MVP

    return {
      content: note.content, // Return plain text content
    };
  }

  /**
   * Check note status without reading it
   */
  async checkNoteStatus(uniqueLink: string): Promise<NoteStatusResponseDto> {
    const note = await this.noteModel.findOne({
      where: {
        uniqueLink,
        deletedAt: null,
      },
      attributes: ['readAt', 'passwordHash', 'expiresAt'],
    });

    if (!note) {
      return {
        exists: false,
        isRead: false,
        hasPassword: false,
      };
    }

    // Check if expired (but don't delete, just report status)
    const isExpired = note.expiresAt && new Date() > note.expiresAt;
    if (isExpired) {
      return {
        exists: true, // Note exists in DB but expired
        isRead: true, // Treat as "read" (unavailable)
        hasPassword: !!note.passwordHash,
      };
    }

    return {
      exists: true,
      isRead: note.isRead, // Uses getter from model
      hasPassword: !!note.passwordHash,
    };
  }

  /**
   * Get statistics about notes (runs every day at midnight)
   * Notes are NOT deleted - kept for developer audit
   * Also updates Prometheus gauge metrics
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async logNotesStatistics(): Promise<void> {
    try {
      // OPTIMIZATION: Single query with aggregation instead of 4 separate COUNT queries
      const stats = await this.noteModel.findAll({
        attributes: [
          [
            this.noteModel.sequelize.fn(
              'COUNT',
              this.noteModel.sequelize.col('id'),
            ),
            'total',
          ],
          [
            this.noteModel.sequelize.fn(
              'SUM',
              this.noteModel.sequelize.literal(
                'CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END',
              ),
            ),
            'read',
          ],
          [
            this.noteModel.sequelize.fn(
              'SUM',
              this.noteModel.sequelize.literal(
                'CASE WHEN read_at IS NULL THEN 1 ELSE 0 END',
              ),
            ),
            'unread',
          ],
          [
            this.noteModel.sequelize.fn(
              'SUM',
              this.noteModel.sequelize.literal(
                `CASE WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 1 ELSE 0 END`,
              ),
            ),
            'expired',
          ],
          [
            this.noteModel.sequelize.fn(
              'SUM',
              this.noteModel.sequelize.literal(
                'CASE WHEN password_hash IS NOT NULL THEN 1 ELSE 0 END',
              ),
            ),
            'password_protected',
          ],
        ],
        raw: true,
      });

      const result = stats[0] as any;

      this.logger.log(
        NOTES_LOGS.STATISTICS(
          result.total || 0,
          result.read || 0,
          result.unread || 0,
          result.expired || 0,
        ),
      );

      // Statistics updated - metrics removed for MVP
    } catch (error) {
      this.logger.error(NOTES_LOGS.STATISTICS_ERROR, error);
    }
  }

  // Optional: Uncomment if you want to enable automatic cleanup after X days
  // /**
  //  * Cleanup very old notes (older than 90 days) - runs once a week
  //  * This is optional - enable if you want to clean up database periodically
  //  */
  // @Cron(CronExpression.EVERY_WEEK)
  // async cleanupOldNotes(): Promise<void> {
  //   try {
  //     const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  //
  //     const result = await this.noteModel.destroy({
  //       where: {
  //         createdAt: {
  //           [Op.lt]: ninetyDaysAgo,
  //         },
  //       },
  //       force: true, // Hard delete
  //     });
  //
  //     if (result > 0) {
  //       this.logger.log(`Cleaned up ${result} notes older than 90 days`);
  //     }
  //   } catch (error) {
  //     this.logger.error('Error cleaning up old notes:', error);
  //   }
  // }

  /**
   * Get all notes (for developer/admin purposes)
   * WARNING: This exposes encrypted content - use carefully!
   * OPTIMIZED: Added index usage and pagination metadata
   */
  async getAllNotes(
    limit: number = NOTES_CONFIG.DEFAULT_PAGE_LIMIT,
    offset: number = 0,
  ) {
    // Enforce reasonable limits to prevent performance issues
    const safeLimit = Math.min(
      Math.max(limit, NOTES_CONFIG.MIN_PAGE_LIMIT),
      NOTES_CONFIG.MAX_PAGE_LIMIT,
    );
    const safeOffset = Math.max(offset, 0);

    // OPTIMIZATION: Uses composite index idx_notes_created_at_read_at for ordering
    const notes = await this.noteModel.findAndCountAll({
      limit: safeLimit,
      offset: safeOffset,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'uniqueLink',
        'readAt',
        'passwordHash',
        'expiresAt',
        'ipAddress',
        'notifyOnRead',
        'ownerId',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: Owner,
          as: 'owner',
          required: false,
          attributes: ['telegramChatId', 'telegramUsername'],
        },
      ],
      // Only fetch non-deleted notes
      where: {
        deletedAt: null,
      },
    });

    return {
      total: notes.count,
      limit: safeLimit,
      offset: safeOffset,
      hasMore: notes.count > safeOffset + safeLimit,
      notes: notes.rows.map(note => ({
        id: note.id,
        uniqueLink: note.uniqueLink,
        isRead: note.isRead, // Uses getter from model
        readAt: note.readAt,
        hasPassword: !!note.passwordHash,
        expiresAt: note.expiresAt,
        ipAddress: note.ipAddress,
        notifyOnRead: note.notifyOnRead,
        hasTelegramNotification: !!note.ownerId,
        telegramChatId: note.owner?.telegramChatId,
        telegramUsername: note.owner?.telegramUsername,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })),
    };
  }

  /**
   * Get all notes with encrypted content and encrypted keys for admin decryption
   * WARNING: This endpoint should be protected with authentication!
   */
  async getAllNotesForAdmin(
    limit: number = NOTES_CONFIG.DEFAULT_PAGE_LIMIT,
    offset: number = 0,
  ) {
    // Enforce reasonable limits to prevent performance issues
    const safeLimit = Math.min(
      Math.max(limit, NOTES_CONFIG.MIN_PAGE_LIMIT),
      NOTES_CONFIG.MAX_PAGE_LIMIT,
    );
    const safeOffset = Math.max(offset, 0);

    const notes = await this.noteModel.findAndCountAll({
      limit: safeLimit,
      offset: safeOffset,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'uniqueLink',
        'content',
        'encryptedKeyForAdmin',
        'readAt',
        'passwordHash',
        'expiresAt',
        'createdAt',
      ],
      // Only fetch non-deleted notes
      where: {
        deletedAt: null,
      },
    });

    return {
      total: notes.count,
      limit: safeLimit,
      offset: safeOffset,
      hasMore: notes.count > safeOffset + safeLimit,
      notes: notes.rows.map(note => ({
        uniqueLink: note.uniqueLink,
        encryptedContent: note.content,
        encryptedKeyForAdmin: note.encryptedKeyForAdmin,
        isRead: note.isRead,
        hasPassword: !!note.passwordHash,
        createdAt: note.createdAt,
        expiresAt: note.expiresAt,
      })),
    };
  }

  /**
   * Get note by ID (for developer/admin purposes)
   * Returns plain text content
   */
  async getNoteById(id: number) {
    const note = await this.noteModel.findByPk(id);

    if (!note) {
      throw new NotFoundException(NOTES_ERRORS.NOTE_NOT_FOUND);
    }

    return {
      id: note.id,
      content: note.content, // Return plain text content
      uniqueLink: note.uniqueLink,
      isRead: note.isRead, // Uses getter from model
      readAt: note.readAt,
      hasPassword: !!note.passwordHash,
      expiresAt: note.expiresAt,
      ipAddress: note.ipAddress,
      notifyOnRead: note.notifyOnRead,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  /**
   * Find note with owner by unique link (for Telegram integration)
   * Returns note with owner information or null if not found
   */
  async findNoteWithOwner(uniqueLink: string): Promise<Note | null> {
    const note = await this.noteModel.findOne({
      where: { uniqueLink },
      include: [
        {
          model: Owner,
          as: 'owner',
          required: false,
        },
      ],
    });

    return note;
  }

  /**
   * Link note to owner (for Telegram activation)
   * Returns true if linked successfully
   */
  async linkNoteToOwner(
    uniqueLink: string,
    ownerId: number,
  ): Promise<boolean> {
    const note = await this.noteModel.findOne({
      where: { uniqueLink },
    });

    if (!note) {
      this.logger.warn(`Cannot link note ${uniqueLink}: note not found`);
      return false;
    }

    if (note.ownerId) {
      this.logger.warn(
        `Note ${uniqueLink} already linked to owner ${note.ownerId}`,
      );
      return false;
    }

    note.ownerId = ownerId;
    await note.save();

    this.logger.log(`✅ Linked note ${uniqueLink} to Owner ${ownerId}`);
    return true;
  }

  /**
   * Verify note ownership by chat ID (for Telegram operations)
   * Returns note if user is owner, null otherwise
   */
  async verifyNoteOwnership(
    uniqueLink: string,
    telegramChatId: string,
  ): Promise<Note | null> {
    const note = await this.noteModel.findOne({
      where: { uniqueLink, deletedAt: null },
      include: [
        {
          model: Owner,
          as: 'owner',
          required: false,
        },
      ],
    });

    if (!note) {
      return null;
    }

    // Check if user is the owner
    if (!note.owner || note.owner.telegramChatId !== telegramChatId) {
      this.logger.warn(
        `⚠️ Ownership verification failed: user ${telegramChatId} is not owner of note ${uniqueLink}`,
      );
      return null;
    }

    return note;
  }

  /**
   * Mark note as read by owner (triggered from Telegram)
   * This makes the note unavailable to everyone without actually deleting it
   */
  async markNoteAsReadByOwner(uniqueLink: string): Promise<boolean> {
    const note = await this.noteModel.findOne({
      where: {
        uniqueLink,
        deletedAt: null,
      },
    });

    if (!note) {
      this.logger.warn(NOTES_LOGS.OWNER_DELETE_NOT_FOUND(uniqueLink));
      return false;
    }

    if (note.isRead) {
      this.logger.warn(NOTES_LOGS.OWNER_DELETE_ALREADY_READ(uniqueLink));
      return false;
    }

    // Mark as read to make it unavailable
    note.readAt = new Date();
    await note.save();

    this.logger.log(NOTES_LOGS.OWNER_DELETE_SUCCESS(uniqueLink));

    return true;
  }

  /**
   * Destroy note by delete link
   * This method finds the note by delete link and destroys it
   */
  async destroyNoteByDeleteLink(deleteLink: string): Promise<boolean> {
    // Find note by deleteLink
    const note = await this.noteModel.findOne({
      where: {
        deleteLink,
        deletedAt: null,
      },
    });

    if (!note) {
      this.logger.warn(`Note not found for delete link: ${deleteLink}`);
      return false;
    }

    if (note.isRead) {
      this.logger.warn(`Note already read for delete link: ${deleteLink}`);
      return false;
    }

    // Mark as read to make it unavailable
    note.readAt = new Date();
    await note.save();

    this.logger.log(`Note destroyed via delete link: ${deleteLink} (uniqueLink: ${note.uniqueLink})`);

    return true;
  }

  /**
   * Enqueue notification to the notifications queue
   * Private helper method to avoid code duplication and improve error handling
   */
  private async enqueueNotification(
    action: TelegramNotificationAction,
    chatId: string,
    noteId: string,
    reason?: string,
  ): Promise<void> {
    try {
      this.logger.log(
        NOTES_LOGS.NOTIFICATION_QUEUED(
          noteId,
          chatId,
          action === TelegramNotificationAction.NOTE_READ
            ? 'successful read'
            : 'failed access',
        ),
      );

      await this.notificationsQueue.add(NotificationType.TELEGRAM, {
        type: NotificationType.TELEGRAM,
        action,
        chatId,
        noteId,
        reason,
      });

      // Queue job added - metrics removed for MVP
    } catch (error) {
      this.logger.error(NOTES_LOGS.NOTIFICATION_QUEUE_ERROR(noteId), error);
      // Don't throw - notification failures shouldn't block the main operation
    }
  }

  /**
   * Generate unique link identifier
   */
  private generateUniqueLink(): string {
    return uuidv4().replace(/-/g, '');
  }

  /**
   * Generate delete link identifier
   * Uses a different format to distinguish from regular links
   */
  private generateDeleteLink(): string {
    return 'del_' + uuidv4().replace(/-/g, '');
  }

  /**
   * Extract browser and OS information from User-Agent string
   */
  private extractBrowserInfo(userAgent: string): string {
    // Simple browser detection
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    // Browser detection
    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
    }

    // OS detection
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac OS')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
    } else if (userAgent.includes('iOS')) {
      os = 'iOS';
    }

    return `${browser} on ${os}`;
  }
}
