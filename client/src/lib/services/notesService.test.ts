import { describe, it, expect, vi, beforeEach } from 'vitest';
import notesService from './notesService';
import * as notesApi from '$lib/api/notesApi';
import * as encryption from '$lib/crypto/encryption';
import * as rsa from '$lib/crypto/rsa';

// Mock the API and crypto modules
vi.mock('$lib/api/notesApi', () => ({
  notesApi: {
    createNote: vi.fn(),
    readNote: vi.fn(),
    checkNoteStatus: vi.fn(),
  },
}));

vi.mock('$lib/crypto/encryption', async (importOriginal) => {
  const actual = await importOriginal<typeof encryption>();
  return {
    ...actual,
    generateEncryptionKey: vi.fn(actual.generateEncryptionKey),
    encryptText: vi.fn(actual.encryptText),
    decryptText: vi.fn(actual.decryptText),
  };
});

vi.mock('$lib/crypto/rsa', async (importOriginal) => {
  const actual = await importOriginal<typeof rsa>();
  return {
    ...actual,
    encryptKeyForAdmin: vi.fn(actual.encryptKeyForAdmin),
  };
});

describe('notesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default environment variable
    import.meta.env.VITE_MASTER_PUBLIC_KEY = 'test-public-key-base64';
  });

  describe('createNote', () => {
    it('should create a note successfully', async () => {
      const mockNoteKey = 'test-note-key-123';
      const mockEncryptedContent = {
        ciphertext: 'encrypted-content',
        iv: 'test-iv',
        tag: 'test-tag',
        metadata: {
          uniqueLink: 'temp-link',
          timestamp: Date.now(),
        },
      };
      const mockMetadataHash = 'mock-metadata-hash';
      const mockResponse = {
        uniqueLink: 'real-unique-link',
        deleteLink: 'delete-link-123',
        message: 'Note created successfully',
      };

      vi.mocked(encryption.generateEncryptionKey).mockResolvedValue(mockNoteKey);
      vi.mocked(encryption.encryptText).mockResolvedValue(mockEncryptedContent);
      vi.mocked(rsa.encryptKeyForAdmin).mockResolvedValue(mockMetadataHash);
      vi.mocked(notesApi.notesApi.createNote).mockResolvedValue(mockResponse);

      const result = await notesService.createNote({
        content: 'Test note content',
        password: 'test-password',
        expiresInDays: 7,
        notifyOnRead: true,
        telegramUsername: '@testuser',
      });

      expect(result).toEqual({
        uniqueLink: 'real-unique-link',
        deleteLink: 'delete-link-123',
        noteKey: mockNoteKey,
        message: 'Note created successfully',
      });

      expect(encryption.generateEncryptionKey).toHaveBeenCalledTimes(1);
      expect(encryption.encryptText).toHaveBeenCalledWith(
        'Test note content',
        mockNoteKey,
        expect.objectContaining({
          uniqueLink: expect.any(String),
          timestamp: expect.any(Number),
        })
      );
      expect(rsa.encryptKeyForAdmin).toHaveBeenCalledWith(mockNoteKey, 'test-public-key-base64');
      expect(notesApi.notesApi.createNote).toHaveBeenCalledWith({
        content: JSON.stringify(mockEncryptedContent),
        metadataHash: mockMetadataHash,
        password: 'test-password',
        expiresInDays: 7,
        notifyOnRead: true,
        telegramUsername: '@testuser',
      });
    });

    it('should create a note without optional parameters', async () => {
      const mockNoteKey = 'test-note-key-123';
      const mockEncryptedContent = {
        ciphertext: 'encrypted-content',
        iv: 'test-iv',
        tag: 'test-tag',
        metadata: {
          uniqueLink: 'temp-link',
          timestamp: Date.now(),
        },
      };
      const mockMetadataHash = 'mock-metadata-hash';
      const mockResponse = {
        uniqueLink: 'real-unique-link',
        deleteLink: 'delete-link-123',
        message: 'Note created successfully',
      };

      vi.mocked(encryption.generateEncryptionKey).mockResolvedValue(mockNoteKey);
      vi.mocked(encryption.encryptText).mockResolvedValue(mockEncryptedContent);
      vi.mocked(rsa.encryptKeyForAdmin).mockResolvedValue(mockMetadataHash);
      vi.mocked(notesApi.notesApi.createNote).mockResolvedValue(mockResponse);

      const result = await notesService.createNote({
        content: 'Simple note',
      });

      expect(result.uniqueLink).toBe('real-unique-link');
      expect(result.noteKey).toBe(mockNoteKey);
    });

    it('should throw error when master public key is not configured', async () => {
      import.meta.env.VITE_MASTER_PUBLIC_KEY = '';

      await expect(
        notesService.createNote({
          content: 'Test note',
        })
      ).rejects.toThrow('Master public key not configured');
    });

    it('should handle encryption errors gracefully', async () => {
      vi.mocked(encryption.generateEncryptionKey).mockResolvedValue('test-key');
      vi.mocked(encryption.encryptText).mockRejectedValue(
        new encryption.EncryptionError('Encryption failed')
      );

      await expect(
        notesService.createNote({
          content: 'Test note',
        })
      ).rejects.toThrow('Encryption failed');
    });

    it('should handle RSA encryption errors gracefully', async () => {
      vi.mocked(encryption.generateEncryptionKey).mockResolvedValue('test-key');
      vi.mocked(encryption.encryptText).mockResolvedValue({
        ciphertext: 'test',
        iv: 'test',
        tag: 'test',
        metadata: { uniqueLink: 'test', timestamp: Date.now() },
      });
      vi.mocked(rsa.encryptKeyForAdmin).mockRejectedValue(
        new rsa.RSAEncryptionError('RSA encryption failed')
      );

      await expect(
        notesService.createNote({
          content: 'Test note',
        })
      ).rejects.toThrow('Admin key encryption failed');
    });
  });

  describe('readNote', () => {
    const mockUniqueLink = 'test-unique-link';
    const mockNoteKey = 'test-note-key-123';
    const mockPassword = 'test-password';

    it('should read and decrypt a note successfully', async () => {
      const mockEncryptedData = {
        ciphertext: 'encrypted-content',
        iv: 'test-iv',
        tag: 'test-tag',
        metadata: {
          uniqueLink: 'temp-link',
          timestamp: Date.now(),
        },
      };
      const mockDecryptedContent = 'This is the decrypted note content';

      vi.mocked(notesApi.notesApi.readNote).mockResolvedValue({
        content: JSON.stringify(mockEncryptedData),
      });
      vi.mocked(encryption.decryptText).mockResolvedValue(mockDecryptedContent);

      const result = await notesService.readNote(mockUniqueLink, mockNoteKey, mockPassword);

      expect(result.content).toBe(mockDecryptedContent);
      expect(notesApi.notesApi.readNote).toHaveBeenCalledWith(mockUniqueLink, {
        password: mockPassword,
      });
      expect(encryption.decryptText).toHaveBeenCalledWith(mockEncryptedData, mockNoteKey);
    });

    it('should read a note without password', async () => {
      const mockEncryptedData = {
        ciphertext: 'encrypted-content',
        iv: 'test-iv',
        tag: 'test-tag',
        metadata: {
          uniqueLink: 'temp-link',
          timestamp: Date.now(),
        },
      };
      const mockDecryptedContent = 'Decrypted content';

      vi.mocked(notesApi.notesApi.readNote).mockResolvedValue({
        content: JSON.stringify(mockEncryptedData),
      });
      vi.mocked(encryption.decryptText).mockResolvedValue(mockDecryptedContent);

      await notesService.readNote(mockUniqueLink, mockNoteKey);

      expect(notesApi.notesApi.readNote).toHaveBeenCalledWith(mockUniqueLink, undefined);
    });

    it('should throw error for invalid encrypted data format', async () => {
      vi.mocked(notesApi.notesApi.readNote).mockResolvedValue({
        content: 'not-valid-json',
      });

      await expect(notesService.readNote(mockUniqueLink, mockNoteKey)).rejects.toThrow(
        'Invalid encrypted data format'
      );
    });

    it('should throw error for missing encrypted data fields', async () => {
      vi.mocked(notesApi.notesApi.readNote).mockResolvedValue({
        content: JSON.stringify({ ciphertext: 'test' }), // Missing other fields
      });

      await expect(notesService.readNote(mockUniqueLink, mockNoteKey)).rejects.toThrow(
        'Encrypted data is missing required fields'
      );
    });

    it('should handle decryption errors gracefully', async () => {
      const mockEncryptedData = {
        ciphertext: 'encrypted-content',
        iv: 'test-iv',
        tag: 'test-tag',
        metadata: {
          uniqueLink: 'temp-link',
          timestamp: Date.now(),
        },
      };

      vi.mocked(notesApi.notesApi.readNote).mockResolvedValue({
        content: JSON.stringify(mockEncryptedData),
      });
      vi.mocked(encryption.decryptText).mockRejectedValue(
        new encryption.DecryptionError('Wrong key or corrupted data')
      );

      await expect(notesService.readNote(mockUniqueLink, mockNoteKey)).rejects.toThrow(
        'Failed to decrypt note'
      );
    });
  });

  describe('checkNoteStatus', () => {
    it('should check note status successfully', async () => {
      const mockStatus = {
        exists: true,
        isRead: false,
        hasPassword: true,
      };

      vi.mocked(notesApi.notesApi.checkNoteStatus).mockResolvedValue(mockStatus);

      const result = await notesService.checkNoteStatus('test-link');

      expect(result).toEqual(mockStatus);
      expect(notesApi.notesApi.checkNoteStatus).toHaveBeenCalledWith('test-link');
    });

    it('should handle API errors', async () => {
      vi.mocked(notesApi.notesApi.checkNoteStatus).mockRejectedValue(
        new Error('Note not found')
      );

      await expect(notesService.checkNoteStatus('invalid-link')).rejects.toThrow(
        'Note not found'
      );
    });
  });
});

