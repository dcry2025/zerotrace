// src/notes/tasks/mark-expired-notes.task.ts

// Nest js
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';

// Other packages
import { Op } from 'sequelize';

// Models
import { Note } from '../models/note-model';

// Constants
import { NOTES_LOGS } from '../notes.constants';

@Injectable()
export class MarkExpiredNotesTask {
  private readonly logger = new Logger(MarkExpiredNotesTask.name);

  constructor(
    @InjectModel(Note)
    private noteModel: typeof Note,
  ) {}

  /**
   * Mark expired notes as read (runs every hour)
   * Checks all notes with expires_at and marks them as read if time expired
   */
  @Cron(CronExpression.EVERY_HOUR)
  async markExpiredNotesAsRead(): Promise<void> {
    try {
      const now = new Date();

      const [affectedCount] = await this.noteModel.update(
        { readAt: now },
        {
          where: {
            expiresAt: {
              [Op.not]: null,
              [Op.lt]: now,
            },
            readAt: null,
            deletedAt: null,
          },
        },
      );

      if (affectedCount === 0) {
        this.logger.log(NOTES_LOGS.TASK_NO_EXPIRED);
        return;
      }

      this.logger.log(NOTES_LOGS.TASK_SUCCESS(affectedCount));
    } catch (error) {
      this.logger.error(NOTES_LOGS.TASK_ERROR, error);
    }
  }
}
