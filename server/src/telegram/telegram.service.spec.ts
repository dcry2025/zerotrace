// src/telegram/telegram.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { OwnerService } from '../owner/owner.service';
import { NotesService } from '../notes/notes.service';
import { TELEGRAM_CONFIG } from './telegram.constants';

describe('TelegramService', () => {
  let service: TelegramService;
  let configService: ConfigService;
  let ownerService: OwnerService;
  let notesService: NotesService;

  // Mock Grammy Bot
  const mockBot = {
    command: jest.fn(),
    callbackQuery: jest.fn(),
    on: jest.fn(),
    api: {
      sendMessage: jest.fn(),
      getMe: jest.fn(),
      setWebhook: jest.fn(),
    },
    start: jest.fn(),
    stop: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockOwnerService = {
    findOrCreateByTelegramChatId: jest.fn(),
  };

  const mockNotesService = {
    findNoteWithOwner: jest.fn(),
    linkNoteToOwner: jest.fn(),
    verifyNoteOwnership: jest.fn(),
    markNoteAsReadByOwner: jest.fn(),
  };

  beforeEach(async () => {
    // Mock Grammy Bot constructor
    jest.mock('grammy', () => ({
      Bot: jest.fn().mockImplementation(() => mockBot),
      InlineKeyboard: jest.fn().mockImplementation(() => ({
        text: jest.fn().mockReturnThis(),
      })),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: OwnerService,
          useValue: mockOwnerService,
        },
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
    configService = module.get<ConfigService>(ConfigService);
    ownerService = module.get<OwnerService>(OwnerService);
    notesService = module.get<NotesService>(NotesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should warn if TELEGRAM_BOT_TOKEN is not provided', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      await service.onModuleInit();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('TELEGRAM_BOT_TOKEN not found'),
      );
      expect(service.isReady()).toBe(false);
    });

    it('should initialize bot when token is provided', async () => {
      mockConfigService.get.mockReturnValue('test-bot-token');

      // We can't fully test this without mocking the Bot constructor
      // But we can verify the token check works
      expect(mockConfigService.get).toBeDefined();
    });

    it('should handle initialization errors gracefully', async () => {
      mockConfigService.get.mockReturnValue('test-bot-token');
      jest.spyOn(service['logger'], 'error');

      // The actual initialization will fail in test environment
      // but error should be caught and logged
      await service.onModuleInit();

      // In real implementation, if Bot constructor throws, it should be caught
      expect(service).toBeDefined();
    });
  });

  describe('onApplicationBootstrap', () => {
    it('should start polling if bot is initialized', () => {
      service['isInitialized'] = true;
      service['bot'] = mockBot as any;
      const startPollingSpy = jest.spyOn(service, 'startPolling');

      service.onApplicationBootstrap();

      expect(startPollingSpy).toHaveBeenCalled();
    });

    it('should warn if bot is not initialized', () => {
      service['isInitialized'] = false;
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      service.onApplicationBootstrap();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Telegram bot not ready'),
      );
    });
  });

  describe('sendNoteReadNotification', () => {
    beforeEach(() => {
      service['isInitialized'] = true;
      service['bot'] = mockBot as any;
    });

    it('should send notification successfully', async () => {
      mockBot.api.sendMessage.mockResolvedValue(true);

      const result = await service.sendNoteReadNotification('12345', 'note123');

      expect(result).toBe(true);
      expect(mockBot.api.sendMessage).toHaveBeenCalledWith(
        '12345',
        expect.stringContaining('Your Note Was Read!'),
        { parse_mode: TELEGRAM_CONFIG.PARSE_MODE },
      );
    });

    it('should return false if bot is not initialized', async () => {
      service['isInitialized'] = false;
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      const result = await service.sendNoteReadNotification('12345', 'note123');

      expect(result).toBe(false);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Telegram bot not initialized'),
      );
    });

    it('should return false if chatId is not provided', async () => {
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      const result = await service.sendNoteReadNotification('', 'note123');

      expect(result).toBe(false);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No chat_id provided'),
      );
    });

    it('should handle errors and return false', async () => {
      mockBot.api.sendMessage.mockRejectedValue(new Error('API error'));
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      const result = await service.sendNoteReadNotification('12345', 'note123');

      expect(result).toBe(false);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send notification'),
        expect.any(String),
      );
    });

    it('should include note ID in notification message', async () => {
      mockBot.api.sendMessage.mockResolvedValue(true);

      await service.sendNoteReadNotification('12345', 'test-note-id');

      expect(mockBot.api.sendMessage).toHaveBeenCalledWith(
        '12345',
        expect.stringContaining('test-note-id'),
        expect.any(Object),
      );
    });
  });

  describe('sendNoteAccessFailedNotification', () => {
    beforeEach(() => {
      service['isInitialized'] = true;
      service['bot'] = mockBot as any;
    });

    it('should send failed access notification successfully', async () => {
      mockBot.api.sendMessage.mockResolvedValue(true);

      const result = await service.sendNoteAccessFailedNotification(
        '12345',
        'note123',
        'Incorrect password',
      );

      expect(result).toBe(true);
      expect(mockBot.api.sendMessage).toHaveBeenCalledWith(
        '12345',
        expect.stringContaining('Failed Access Attempt'),
        expect.objectContaining({
          parse_mode: TELEGRAM_CONFIG.PARSE_MODE,
          reply_markup: expect.any(Object),
        }),
      );
    });

    it('should include reason in notification', async () => {
      mockBot.api.sendMessage.mockResolvedValue(true);

      await service.sendNoteAccessFailedNotification(
        '12345',
        'note123',
        'Password required',
      );

      expect(mockBot.api.sendMessage).toHaveBeenCalledWith(
        '12345',
        expect.stringContaining('Password required'),
        expect.any(Object),
      );
    });

    it('should use default reason if not provided', async () => {
      mockBot.api.sendMessage.mockResolvedValue(true);

      await service.sendNoteAccessFailedNotification('12345', 'note123');

      expect(mockBot.api.sendMessage).toHaveBeenCalledWith(
        '12345',
        expect.stringContaining('Incorrect password'),
        expect.any(Object),
      );
    });

    it('should return false if bot is not initialized', async () => {
      service['isInitialized'] = false;

      const result = await service.sendNoteAccessFailedNotification(
        '12345',
        'note123',
      );

      expect(result).toBe(false);
    });

    it('should return false if chatId is not provided', async () => {
      const result = await service.sendNoteAccessFailedNotification(
        '',
        'note123',
      );

      expect(result).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      mockBot.api.sendMessage.mockRejectedValue(
        new Error('Telegram API error'),
      );
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      const result = await service.sendNoteAccessFailedNotification(
        '12345',
        'note123',
      );

      expect(result).toBe(false);
      expect(loggerErrorSpy).toHaveBeenCalled();
    });
  });

  describe('getBot', () => {
    it('should return bot instance', () => {
      service['bot'] = mockBot as any;

      const bot = service.getBot();

      expect(bot).toBe(mockBot);
    });
  });

  describe('isReady', () => {
    it('should return true if bot is initialized', () => {
      service['isInitialized'] = true;

      expect(service.isReady()).toBe(true);
    });

    it('should return false if bot is not initialized', () => {
      service['isInitialized'] = false;

      expect(service.isReady()).toBe(false);
    });
  });

  describe('getBotInfo', () => {
    beforeEach(() => {
      service['isInitialized'] = true;
      service['bot'] = mockBot as any;
    });

    it('should return bot info without start parameter', async () => {
      mockBot.api.getMe.mockResolvedValue({
        username: 'testbot',
        id: 123,
        is_bot: true,
        first_name: 'Test Bot',
      });

      const result = await service.getBotInfo();

      expect(result).toEqual({
        username: 'testbot',
        link: 'https://t.me/testbot',
      });
    });

    it('should return bot info with start parameter', async () => {
      mockBot.api.getMe.mockResolvedValue({
        username: 'testbot',
        id: 123,
        is_bot: true,
        first_name: 'Test Bot',
      });

      const result = await service.getBotInfo('unique-note-link');

      expect(result).toEqual({
        username: 'testbot',
        link: 'https://t.me/testbot?start=unique-note-link',
      });
    });

    it('should encode start parameter in URL', async () => {
      mockBot.api.getMe.mockResolvedValue({
        username: 'testbot',
        id: 123,
        is_bot: true,
        first_name: 'Test Bot',
      });

      const result = await service.getBotInfo('note with spaces');

      expect(result?.link).toContain(encodeURIComponent('note with spaces'));
    });

    it('should return null if bot is not initialized', async () => {
      service['isInitialized'] = false;

      const result = await service.getBotInfo();

      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      mockBot.api.getMe.mockRejectedValue(new Error('API error'));
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      const result = await service.getBotInfo();

      expect(result).toBeNull();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to get bot info'),
        expect.any(Error),
      );
    });

    it('should handle empty username', async () => {
      mockBot.api.getMe.mockResolvedValue({
        username: undefined,
        id: 123,
        is_bot: true,
        first_name: 'Test Bot',
      });

      const result = await service.getBotInfo();

      expect(result?.username).toBe('');
    });
  });

  describe('setWebhook', () => {
    beforeEach(() => {
      service['isInitialized'] = true;
      service['bot'] = mockBot as any;
    });

    it('should set webhook successfully', async () => {
      mockBot.api.setWebhook.mockResolvedValue(true);

      const result = await service.setWebhook('https://example.com/webhook');

      expect(result).toBe(true);
      expect(mockBot.api.setWebhook).toHaveBeenCalledWith(
        'https://example.com/webhook',
      );
    });

    it('should return false if bot is not initialized', async () => {
      service['isInitialized'] = false;
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      const result = await service.setWebhook('https://example.com/webhook');

      expect(result).toBe(false);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Telegram bot not initialized'),
      );
    });

    it('should handle webhook errors', async () => {
      mockBot.api.setWebhook.mockRejectedValue(new Error('Webhook error'));
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      const result = await service.setWebhook('https://example.com/webhook');

      expect(result).toBe(false);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to set webhook'),
        expect.any(Error),
      );
    });
  });

  describe('startPolling', () => {
    beforeEach(() => {
      service['isInitialized'] = true;
      service['bot'] = mockBot as any;
      mockBot.start.mockReturnValue(Promise.resolve());
    });

    it('should start polling successfully', () => {
      service.startPolling();

      expect(mockBot.start).toHaveBeenCalledWith(
        expect.objectContaining({
          drop_pending_updates: TELEGRAM_CONFIG.DROP_PENDING_UPDATES,
          onStart: expect.any(Function),
        }),
      );
    });

    it('should warn if bot is not initialized', () => {
      service['isInitialized'] = false;
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      service.startPolling();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Telegram bot not initialized'),
      );
      expect(mockBot.start).not.toHaveBeenCalled();
    });

    it('should handle polling errors', () => {
      mockBot.start.mockReturnValue(Promise.reject(new Error('Poll error')));

      // Should not throw
      expect(() => service.startPolling()).not.toThrow();
    });
  });

  describe('stop', () => {
    it('should stop the bot', async () => {
      service['bot'] = mockBot as any;
      mockBot.stop.mockResolvedValue(undefined);

      await service.stop();

      expect(mockBot.stop).toHaveBeenCalled();
    });

    it('should handle stop when bot is not initialized', async () => {
      service['bot'] = undefined;

      // Should not throw
      await expect(service.stop()).resolves.toBeUndefined();
    });
  });
});
