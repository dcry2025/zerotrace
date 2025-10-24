// src/telegram/telegram.module.ts

// Nest js
import { Module } from '@nestjs/common';

// Service and Controller
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';

// Queue
import { QueueModule } from '../queue/queue.module';
import { TelegramNotificationProcessor } from './processors/telegram-notification.processor';

// Owner Module
import { OwnerModule } from '../owner';

// Notes Module
import { NotesModule } from '../notes/notes.module';

@Module({
  imports: [OwnerModule, NotesModule, QueueModule],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramNotificationProcessor],
  exports: [TelegramService],
})
export class TelegramModule {}
