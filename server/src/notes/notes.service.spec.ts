// src/notes/notes.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { getQueueToken } from '@nestjs/bullmq';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { Note } from './models/note-model';
import { NOTIFICATIONS_QUEUE_NAME } from '../queue/queues/notifications.queue';
import { NOTES_ERRORS } from './notes.constants';

describe('NotesService', () => {
  let service: NotesService;
  let mockNoteModel: any;
  let mockNotificationsQueue: any;

  beforeEach(async () => {
    // Mock Note model
    mockNoteModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      destroy: jest.fn(),
      sequelize: {
        fn: jest.fn((func, _col) => `fn:${func}`),
        col: jest.fn(name => `col:${name}`),
        literal: jest.fn(sql => `literal:${sql}`),
      },
    };

    // Mock Notifications Queue
    mockNotificationsQueue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getModelToken(Note),
          useValue: mockNoteModel,
        },
        {
          provide: getQueueToken(NOTIFICATIONS_QUEUE_NAME),
          useValue: mockNotificationsQueue,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNote', () => {
    it('should create a note successfully with minimal data', async () => {
      const createNoteDto = {
        content: 'Test note content',
      };

      const mockNote = {
        id: 1,
        uniqueLink: 'test123',
        content: 'Test note content',
        expiresAt: null,
        readAt: null,
        createdAt: new Date(),
      };

      mockNoteModel.create.mockResolvedValue(mockNote);

      const result = await service.createNote(createNoteDto);

      expect(result).toHaveProperty('uniqueLink');
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Note created successfully');
      expect(mockNoteModel.create).toHaveBeenCalled();
    });

    it('should create a note with all optional fields', async () => {
      const createNoteDto = {
        content: 'Secure note content',
        metadataHash: 'metadata-hash-123',
        password: 'secret123',
        expiresInDays: 7,
        notifyOnRead: true,
      };

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const mockNote = {
        id: 2,
        uniqueLink: 'test456',
        content: 'Secure note content',
        expiresAt,
        readAt: null,
        notifyOnRead: true,
      };

      mockNoteModel.create.mockResolvedValue(mockNote);

      const result = await service.createNote(
        createNoteDto,
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(result.uniqueLink).toBeDefined();
      expect(mockNoteModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Secure note content',
          metadataHash: 'metadata-hash-123',
          password: 'secret123',
          notifyOnRead: true,
          expiresAt: expect.any(Date),
          ipAddress: '192.168.1.1',
          ownerId: null,
          readAt: null,
        }),
      );
    });

    it('should calculate expiration date correctly', async () => {
      const createNoteDto = {
        content: 'Expiring note',
        expiresInDays: 3,
      };

      const mockNote = {
        uniqueLink: 'test789',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      };

      mockNoteModel.create.mockResolvedValue(mockNote);

      await service.createNote(createNoteDto);

      expect(mockNoteModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expect.any(Date),
        }),
      );
    });

    it('should throw error for content that is too long', async () => {
      const createNoteDto = {
        content: 'a'.repeat(50001), // Exceeds MAX_CONTENT_LENGTH
      };

      await expect(service.createNote(createNoteDto)).rejects.toThrow(
        NOTES_ERRORS.INVALID_CONTENT_LENGTH,
      );
    });

    it('should throw error if content is empty after sanitization', async () => {
      const createNoteDto = {
        content: '   ', // Only whitespace
      };

      await expect(service.createNote(createNoteDto)).rejects.toThrow(
        NOTES_ERRORS.CONTENT_EMPTY_AFTER_SANITIZATION,
      );
    });
  });

  describe('readNote', () => {
    it('should read a note successfully without password', async () => {
      const uniqueLink = 'test123';
      const mockNote = {
        id: 1,
        uniqueLink,
        content: 'Test content',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: false,
        owner: null,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.readNote(uniqueLink, {});

      expect(result.content).toBe('Test content');
      expect(mockNote.save).toHaveBeenCalled();
      expect(mockNote.readAt).toBeTruthy();
    });

    it('should throw NotFoundException if note not found', async () => {
      mockNoteModel.findOne.mockResolvedValue(null);

      await expect(service.readNote('nonexistent', {})).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.readNote('nonexistent', {})).rejects.toThrow(
        NOTES_ERRORS.NOTE_NOT_FOUND,
      );
    });

    it('should throw NotFoundException if note already read', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        readAt: new Date(),
        isRead: true,
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await expect(service.readNote('test123', {})).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.readNote('test123', {})).rejects.toThrow(
        NOTES_ERRORS.NOTE_ALREADY_READ,
      );
    });

    it('should throw NotFoundException if note expired', async () => {
      const expiredDate = new Date(Date.now() - 1000);
      const mockNote = {
        uniqueLink: 'test123',
        readAt: null,
        expiresAt: expiredDate,
        isRead: false,
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await expect(service.readNote('test123', {})).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.readNote('test123', {})).rejects.toThrow(
        NOTES_ERRORS.NOTE_EXPIRED,
      );
    });

    it('should throw UnauthorizedException if password required but not provided', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        readAt: null,
        expiresAt: null,
        passwordHash: 'hashed-password',
        notifyOnRead: false,
        identity: null,
        isRead: false,
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await expect(service.readNote('test123', {})).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.readNote('test123', {})).rejects.toThrow(
        NOTES_ERRORS.PASSWORD_REQUIRED,
      );
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        readAt: null,
        expiresAt: null,
        passwordHash: 'hashed-password',
        notifyOnRead: false,
        identity: null,
        isRead: false,
        verifyPassword: jest.fn().mockResolvedValue(false),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await expect(
        service.readNote('test123', { password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.readNote('test123', { password: 'wrong' }),
      ).rejects.toThrow(NOTES_ERRORS.PASSWORD_INCORRECT);
    });

    it('should read password-protected note with correct password', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        content: 'Secret content',
        readAt: null,
        expiresAt: null,
        passwordHash: 'hashed-password',
        notifyOnRead: false,
        identity: null,
        isRead: false,
        createdAt: new Date(),
        verifyPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.readNote('test123', {
        password: 'correct',
      });

      expect(result.content).toBe('Secret content');
      expect(mockNote.save).toHaveBeenCalled();
      expect(mockNote.verifyPassword).toHaveBeenCalledWith('correct');
    });

    it('should send notification if notifyOnRead enabled and owner exists', async () => {
      const mockOwner = {
        id: 1,
        telegramChatId: '12345',
      };

      const mockNote = {
        uniqueLink: 'test123',
        content: 'Content',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: true,
        owner: mockOwner,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await service.readNote('test123', {});

      expect(mockNotificationsQueue.add).toHaveBeenCalled();
    });

    it('should send failed access notification on wrong password', async () => {
      const mockOwner = {
        id: 1,
        telegramChatId: '12345',
      };

      const mockNote = {
        uniqueLink: 'test123',
        readAt: null,
        expiresAt: null,
        passwordHash: 'hashed',
        notifyOnRead: true,
        owner: mockOwner,
        isRead: false,
        verifyPassword: jest.fn().mockResolvedValue(false),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await expect(
        service.readNote('test123', { password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockNotificationsQueue.add).toHaveBeenCalled();
    });
  });

  describe('checkNoteStatus', () => {
    it('should return exists false for non-existent note', async () => {
      mockNoteModel.findOne.mockResolvedValue(null);

      const result = await service.checkNoteStatus('nonexistent');

      expect(result.exists).toBe(false);
      expect(result.isRead).toBe(false);
      expect(result.hasPassword).toBe(false);
    });

    it('should return correct status for unread note without password', async () => {
      const mockNote = {
        readAt: null,
        passwordHash: null,
        expiresAt: null,
        isRead: false,
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.checkNoteStatus('test123');

      expect(result.exists).toBe(true);
      expect(result.isRead).toBe(false);
      expect(result.hasPassword).toBe(false);
    });

    it('should return correct status for note with password', async () => {
      const mockNote = {
        readAt: null,
        passwordHash: 'hashed',
        expiresAt: null,
        isRead: false,
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.checkNoteStatus('test123');

      expect(result.exists).toBe(true);
      expect(result.hasPassword).toBe(true);
    });

    it('should return isRead true for expired note', async () => {
      const expiredDate = new Date(Date.now() - 1000);
      const mockNote = {
        readAt: null,
        passwordHash: null,
        expiresAt: expiredDate,
        isRead: false,
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.checkNoteStatus('test123');

      expect(result.exists).toBe(true);
      expect(result.isRead).toBe(true); // Expired = unavailable
    });

    it('should return isRead true for already read note', async () => {
      const mockNote = {
        readAt: new Date(),
        passwordHash: null,
        expiresAt: null,
        isRead: true,
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.checkNoteStatus('test123');

      expect(result.exists).toBe(true);
      expect(result.isRead).toBe(true);
    });
  });

  describe('logNotesStatistics', () => {
    it('should log statistics successfully', async () => {
      const mockStats = [
        {
          total: 100,
          read: 60,
          unread: 30,
          expired: 10,
        },
      ];

      mockNoteModel.findAll.mockResolvedValue(mockStats);

      await service.logNotesStatistics();

      expect(mockNoteModel.findAll).toHaveBeenCalled();
    });

    it('should handle zero statistics', async () => {
      const mockStats = [
        {
          total: 0,
          read: 0,
          unread: 0,
          expired: 0,
        },
      ];

      mockNoteModel.findAll.mockResolvedValue(mockStats);

      await service.logNotesStatistics();

      expect(mockNoteModel.findAll).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockNoteModel.findAll.mockRejectedValue(new Error('DB error'));

      // Should not throw
      await expect(service.logNotesStatistics()).resolves.toBeUndefined();
    });
  });

  describe('findNoteWithOwner', () => {
    it('should find note with owner', async () => {
      const mockNote = {
        id: 1,
        uniqueLink: 'test123',
        owner: {
          id: 1,
          telegramChatId: '12345',
        },
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.findNoteWithOwner('test123');

      expect(result).toEqual(mockNote);
      expect(mockNoteModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { uniqueLink: 'test123' },
        }),
      );
    });

    it('should return null if note not found', async () => {
      mockNoteModel.findOne.mockResolvedValue(null);

      const result = await service.findNoteWithOwner('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('linkNoteToOwner', () => {
    it('should link note to owner successfully', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        ownerId: null,
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.linkNoteToOwner('test123', 1);

      expect(result).toBe(true);
      expect(mockNote.ownerId).toBe(1);
      expect(mockNote.save).toHaveBeenCalled();
    });

    it('should return false if note not found', async () => {
      mockNoteModel.findOne.mockResolvedValue(null);

      const result = await service.linkNoteToOwner('nonexistent', 1);

      expect(result).toBe(false);
    });

    it('should return false if note already linked', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        ownerId: 2,
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.linkNoteToOwner('test123', 1);

      expect(result).toBe(false);
    });
  });

  describe('verifyNoteOwnership', () => {
    it('should verify ownership successfully', async () => {
      const mockNote = {
        id: 1,
        uniqueLink: 'test123',
        owner: {
          id: 1,
          telegramChatId: '12345',
        },
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.verifyNoteOwnership('test123', '12345');

      expect(result).toEqual(mockNote);
    });

    it('should return null if note not found', async () => {
      mockNoteModel.findOne.mockResolvedValue(null);

      const result = await service.verifyNoteOwnership('nonexistent', '12345');

      expect(result).toBeNull();
    });

    it('should return null if user is not owner', async () => {
      const mockNote = {
        id: 1,
        uniqueLink: 'test123',
        owner: {
          id: 1,
          telegramChatId: '99999',
        },
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.verifyNoteOwnership('test123', '12345');

      expect(result).toBeNull();
    });

    it('should return null if note has no owner', async () => {
      const mockNote = {
        id: 1,
        uniqueLink: 'test123',
        owner: null,
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.verifyNoteOwnership('test123', '12345');

      expect(result).toBeNull();
    });
  });

  describe('markNoteAsReadByOwner', () => {
    it('should mark note as read successfully', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        readAt: null,
        isRead: false,
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.markNoteAsReadByOwner('test123');

      expect(result).toBe(true);
      expect(mockNote.readAt).toBeTruthy();
      expect(mockNote.save).toHaveBeenCalled();
    });

    it('should return false if note not found', async () => {
      mockNoteModel.findOne.mockResolvedValue(null);

      const result = await service.markNoteAsReadByOwner('nonexistent');

      expect(result).toBe(false);
    });

    it('should return false if note already read', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        readAt: new Date(),
        isRead: true,
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      const result = await service.markNoteAsReadByOwner('test123');

      expect(result).toBe(false);
    });
  });

  describe('readNote - browser info extraction', () => {
    it('should extract Chrome browser info from user agent', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        content: 'Test',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: false,
        owner: null,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await service.readNote(
        'test123',
        {},
        '192.168.1.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      );

      expect(mockNote.save).toHaveBeenCalled();
    });

    it('should extract Firefox browser info from user agent', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        content: 'Test',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: false,
        owner: null,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await service.readNote(
        'test123',
        {},
        '192.168.1.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      );

      expect(mockNote.save).toHaveBeenCalled();
    });

    it('should extract Safari browser info from user agent', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        content: 'Test',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: false,
        owner: null,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await service.readNote(
        'test123',
        {},
        '192.168.1.1',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      );

      expect(mockNote.save).toHaveBeenCalled();
    });

    it('should extract Edge browser info from user agent', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        content: 'Test',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: false,
        owner: null,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await service.readNote(
        'test123',
        {},
        '192.168.1.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
      );

      expect(mockNote.save).toHaveBeenCalled();
    });

    it('should extract macOS info from user agent', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        content: 'Test',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: false,
        owner: null,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await service.readNote(
        'test123',
        {},
        '192.168.1.1',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      );

      expect(mockNote.save).toHaveBeenCalled();
    });

    it('should extract Linux info from user agent', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        content: 'Test',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: false,
        owner: null,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await service.readNote(
        'test123',
        {},
        '192.168.1.1',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      );

      expect(mockNote.save).toHaveBeenCalled();
    });

    it('should extract Android info from user agent', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        content: 'Test',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: false,
        owner: null,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await service.readNote(
        'test123',
        {},
        '192.168.1.1',
        'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
      );

      expect(mockNote.save).toHaveBeenCalled();
    });

    it('should extract iOS info from user agent', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        content: 'Test',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: false,
        owner: null,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await service.readNote(
        'test123',
        {},
        '192.168.1.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
      );

      expect(mockNote.save).toHaveBeenCalled();
    });

    it('should handle unknown user agent', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        content: 'Test',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: false,
        owner: null,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await service.readNote(
        'test123',
        {},
        '192.168.1.1',
        'UnknownBrowser/1.0',
      );

      expect(mockNote.save).toHaveBeenCalled();
    });

    it('should handle missing IP and user agent', async () => {
      const mockNote = {
        uniqueLink: 'test123',
        content: 'Test',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: false,
        owner: null,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);

      await service.readNote('test123', {});

      expect(mockNote.save).toHaveBeenCalled();
    });
  });

  describe('readNote - notification error handling', () => {
    it('should handle notification queue error gracefully', async () => {
      const mockOwner = {
        id: 1,
        telegramChatId: '12345',
      };

      const mockNote = {
        uniqueLink: 'test123',
        content: 'Content',
        readAt: null,
        expiresAt: null,
        passwordHash: null,
        notifyOnRead: true,
        owner: mockOwner,
        isRead: false,
        createdAt: new Date(),
        save: jest.fn(),
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);
      mockNotificationsQueue.add.mockRejectedValue(new Error('Queue error'));

      // Should not throw - notification failure should not block reading
      await expect(service.readNote('test123', {})).resolves.toBeDefined();
    });

    it('should handle notification queue error on failed password attempt', async () => {
      const mockOwner = {
        id: 1,
        telegramChatId: '12345',
      };

      const mockNote = {
        uniqueLink: 'test123',
        readAt: null,
        expiresAt: null,
        passwordHash: 'hashed',
        notifyOnRead: true,
        owner: mockOwner,
        isRead: false,
      };

      mockNoteModel.findOne.mockResolvedValue(mockNote);
      mockNotificationsQueue.add.mockRejectedValue(new Error('Queue error'));

      // Should still throw UnauthorizedException even if notification fails
      await expect(service.readNote('test123', {})).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
