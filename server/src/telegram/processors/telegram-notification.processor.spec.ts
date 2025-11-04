// src/telegram/processors/telegram-notification.processor.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { TelegramNotificationProcessor } from './telegram-notification.processor';
import { TelegramService } from '../telegram.service';
import {
  NotificationType,
  TelegramNotificationAction,
  NotificationJobData,
  TelegramNotificationJob,
} from '../../queue/types/notification-job.types';

describe('TelegramNotificationProcessor', () => {
  let processor: TelegramNotificationProcessor;
  let telegramService: TelegramService;

  const mockTelegramService = {
    sendNoteReadNotification: jest.fn(),
    sendNoteAccessFailedNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramNotificationProcessor,
        {
          provide: TelegramService,
          useValue: mockTelegramService,
        },
      ],
    }).compile();

    processor = module.get<TelegramNotificationProcessor>(
      TelegramNotificationProcessor,
    );
    telegramService = module.get<TelegramService>(TelegramService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockJob = (data: NotificationJobData): Partial<Job> => ({
    id: '1',
    data,
    attemptsMade: 0,
    opts: { attempts: 3 },
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should skip non-Telegram notification types', async () => {
      const job = createMockJob({
        type: 'EMAIL' as any,
        action: 'SEND' as any,
        to: 'test@example.com',
        subject: 'Test',
        body: 'Test body',
      } as any);

      await processor.process(job as Job);

      expect(
        mockTelegramService.sendNoteReadNotification,
      ).not.toHaveBeenCalled();
      expect(
        mockTelegramService.sendNoteAccessFailedNotification,
      ).not.toHaveBeenCalled();
    });

    it('should process NOTE_READ action successfully', async () => {
      mockTelegramService.sendNoteReadNotification.mockResolvedValue(true);

      const jobData: TelegramNotificationJob = {
        type: NotificationType.TELEGRAM,
        action: TelegramNotificationAction.NOTE_READ,
        chatId: '12345',
        noteId: 'note123',
      };

      const job = createMockJob(jobData);

      await processor.process(job as Job);

      expect(mockTelegramService.sendNoteReadNotification).toHaveBeenCalledWith(
        '12345',
        'note123',
      );
    });

    it('should process NOTE_ACCESS_FAILED action successfully', async () => {
      mockTelegramService.sendNoteAccessFailedNotification.mockResolvedValue(
        true,
      );

      const jobData: TelegramNotificationJob = {
        type: NotificationType.TELEGRAM,
        action: TelegramNotificationAction.NOTE_ACCESS_FAILED,
        chatId: '12345',
        noteId: 'note123',
        reason: 'Incorrect password',
      };

      const job = createMockJob(jobData);

      await processor.process(job as Job);

      expect(
        mockTelegramService.sendNoteAccessFailedNotification,
      ).toHaveBeenCalledWith('12345', 'note123', 'Incorrect password');
    });

    it('should process NOTE_ACCESS_FAILED without reason', async () => {
      mockTelegramService.sendNoteAccessFailedNotification.mockResolvedValue(
        true,
      );

      const jobData: TelegramNotificationJob = {
        type: NotificationType.TELEGRAM,
        action: TelegramNotificationAction.NOTE_ACCESS_FAILED,
        chatId: '12345',
        noteId: 'note123',
      };

      const job = createMockJob(jobData);

      await processor.process(job as Job);

      expect(
        mockTelegramService.sendNoteAccessFailedNotification,
      ).toHaveBeenCalledWith('12345', 'note123', undefined);
    });

    it('should throw error for unknown action', async () => {
      const jobData = {
        type: NotificationType.TELEGRAM,
        action: 'UNKNOWN_ACTION' as any,
        chatId: '12345',
        noteId: 'note123',
      } as any;

      const job = createMockJob(jobData);

      await expect(processor.process(job as Job)).rejects.toThrow(
        'Unknown Telegram action',
      );
    });

    it('should throw error if service returns false', async () => {
      mockTelegramService.sendNoteReadNotification.mockResolvedValue(false);

      const jobData: TelegramNotificationJob = {
        type: NotificationType.TELEGRAM,
        action: TelegramNotificationAction.NOTE_READ,
        chatId: '12345',
        noteId: 'note123',
      };

      const job = createMockJob(jobData);

      await expect(processor.process(job as Job)).rejects.toThrow(
        'Telegram service returned false',
      );
    });

    it('should throw error if service throws', async () => {
      mockTelegramService.sendNoteReadNotification.mockRejectedValue(
        new Error('API error'),
      );

      const jobData: TelegramNotificationJob = {
        type: NotificationType.TELEGRAM,
        action: TelegramNotificationAction.NOTE_READ,
        chatId: '12345',
        noteId: 'note123',
      };

      const job = createMockJob(jobData);

      await expect(processor.process(job as Job)).rejects.toThrow('API error');
    });

    it('should log processing attempt', async () => {
      mockTelegramService.sendNoteReadNotification.mockResolvedValue(true);
      const logSpy = jest.spyOn(processor['logger'], 'log');

      const jobData: TelegramNotificationJob = {
        type: NotificationType.TELEGRAM,
        action: TelegramNotificationAction.NOTE_READ,
        chatId: '12345',
        noteId: 'note123',
      };

      const job = createMockJob(jobData);

      await processor.process(job as Job);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing Telegram job'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Successfully processed'),
      );
    });

    it('should log errors', async () => {
      mockTelegramService.sendNoteReadNotification.mockRejectedValue(
        new Error('Test error'),
      );
      const errorSpy = jest.spyOn(processor['logger'], 'error');

      const jobData: TelegramNotificationJob = {
        type: NotificationType.TELEGRAM,
        action: TelegramNotificationAction.NOTE_READ,
        chatId: '12345',
        noteId: 'note123',
      };

      const job = createMockJob(jobData);

      await expect(processor.process(job as Job)).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process'),
        expect.any(String),
      );
    });

    it('should track attempt number', async () => {
      mockTelegramService.sendNoteReadNotification.mockResolvedValue(true);
      const logSpy = jest.spyOn(processor['logger'], 'log');

      const jobData: TelegramNotificationJob = {
        type: NotificationType.TELEGRAM,
        action: TelegramNotificationAction.NOTE_READ,
        chatId: '12345',
        noteId: 'note123',
      };

      const job = {
        ...createMockJob(jobData),
        attemptsMade: 2,
      };

      await processor.process(job as Job);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('attempt 3/3'),
      );
    });
  });

  describe('onCompleted', () => {
    it('should log completion for Telegram jobs', async () => {
      const logSpy = jest.spyOn(processor['logger'], 'log');

      const jobData: TelegramNotificationJob = {
        type: NotificationType.TELEGRAM,
        action: TelegramNotificationAction.NOTE_READ,
        chatId: '12345',
        noteId: 'note123',
      };

      const job = createMockJob(jobData);

      await processor.onCompleted(job as Job);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('completed successfully'),
      );
    });

    it('should not log for non-Telegram jobs', async () => {
      const logSpy = jest.spyOn(processor['logger'], 'log');

      const job = createMockJob({
        type: 'EMAIL' as any,
        action: 'SEND' as any,
        to: 'test@example.com',
        subject: 'Test',
        body: 'Test body',
      } as any);

      await processor.onCompleted(job as Job);

      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('onFailed', () => {
    it('should log failure for Telegram jobs', async () => {
      const errorSpy = jest.spyOn(processor['logger'], 'error');

      const jobData: TelegramNotificationJob = {
        type: NotificationType.TELEGRAM,
        action: TelegramNotificationAction.NOTE_READ,
        chatId: '12345',
        noteId: 'note123',
      };

      const job = createMockJob(jobData);
      const error = new Error('Test failure');

      await processor.onFailed(job as Job, error);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('failed permanently'),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(JSON.stringify(jobData)),
      );
    });

    it('should not log for non-Telegram jobs', async () => {
      const errorSpy = jest.spyOn(processor['logger'], 'error');

      const job = createMockJob({
        type: 'EMAIL' as any,
        action: 'SEND' as any,
        to: 'test@example.com',
        subject: 'Test',
        body: 'Test body',
      } as any);

      await processor.onFailed(job as Job, new Error('Test'));

      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('onActive', () => {
    it('should log when Telegram job becomes active', async () => {
      const logSpy = jest.spyOn(processor['logger'], 'log');

      const jobData: TelegramNotificationJob = {
        type: NotificationType.TELEGRAM,
        action: TelegramNotificationAction.NOTE_READ,
        chatId: '12345',
        noteId: 'note123',
      };

      const job = createMockJob(jobData);

      await processor.onActive(job as Job);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('is now active'),
      );
    });

    it('should not log for non-Telegram jobs', async () => {
      const logSpy = jest.spyOn(processor['logger'], 'log');

      const job = createMockJob({
        type: 'EMAIL' as any,
        action: 'SEND' as any,
        to: 'test@example.com',
        subject: 'Test',
        body: 'Test body',
      } as any);

      await processor.onActive(job as Job);

      expect(logSpy).not.toHaveBeenCalled();
    });

    it('should show correct attempt number', async () => {
      const logSpy = jest.spyOn(processor['logger'], 'log');

      const jobData: TelegramNotificationJob = {
        type: NotificationType.TELEGRAM,
        action: TelegramNotificationAction.NOTE_READ,
        chatId: '12345',
        noteId: 'note123',
      };

      const job = {
        ...createMockJob(jobData),
        attemptsMade: 1,
      };

      await processor.onActive(job as Job);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('attempt 2'));
    });
  });
});
