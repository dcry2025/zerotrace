// src/notes/notes.module.ts

// Nest js
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

// Controllers
import { NotesController } from './notes.controller';

// Services
import { NotesService } from './notes.service';

// Tasks
import { MarkExpiredNotesTask } from './tasks/mark-expired-notes.task';

// Entities
import { Note } from './models/note-model';
import { Owner } from '../owner/models/owner-model';

// Owner Module
import { OwnerModule } from '../owner/owner.module';

// Queue Module
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Note, Owner]),
    OwnerModule,
    QueueModule,
  ],
  controllers: [NotesController],
  providers: [NotesService, MarkExpiredNotesTask],
  exports: [NotesService],
})
export class NotesModule {}
