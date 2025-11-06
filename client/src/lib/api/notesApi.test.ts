import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notesApi } from './notesApi';
import type { CreateNoteDto, ReadNoteDto } from './notesApi';

// Mock ky
vi.mock('ky', () => {
	return {
		default: {
			post: vi.fn(),
			get: vi.fn(),
			delete: vi.fn()
		}
	};
});

import ky from 'ky';

describe('notesApi', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createNote', () => {
		it('should create a note successfully', async () => {
			const mockResponse = {
				uniqueLink: 'abc123',
				deleteLink: 'delete-abc123',
				message: 'Note created successfully'
			};

			const mockData: CreateNoteDto = {
				content: 'encrypted-content',
				metadataHash: 'hash123',
				password: 'test-password',
				expiresInDays: 7,
				notifyOnRead: true
			};

			vi.mocked(ky.post).mockReturnValue({
				json: vi.fn().mockResolvedValue(mockResponse)
			} as any);

			const result = await notesApi.createNote(mockData);

			expect(result).toEqual(mockResponse);
			expect(ky.post).toHaveBeenCalledWith('/api/notes', {
				json: mockData,
				timeout: 30000
			});
		});

		it('should handle API errors', async () => {
			vi.mocked(ky.post).mockReturnValue({
				json: vi.fn().mockRejectedValue(new Error('Network error'))
			} as any);

			await expect(
				notesApi.createNote({
					content: 'test'
				})
			).rejects.toThrow('Network error');
		});
	});

	describe('readNote', () => {
		it('should read a note successfully', async () => {
			const mockResponse = {
				content: 'decrypted-content'
			};

			vi.mocked(ky.post).mockReturnValue({
				json: vi.fn().mockResolvedValue(mockResponse)
			} as any);

			const result = await notesApi.readNote('abc123', { password: 'test-pass' });

			expect(result).toEqual(mockResponse);
			expect(ky.post).toHaveBeenCalledWith('/api/notes/abc123/read', {
				json: { password: 'test-pass' },
				timeout: 30000
			});
		});

		it('should read a note without password', async () => {
			const mockResponse = {
				content: 'decrypted-content'
			};

			vi.mocked(ky.post).mockReturnValue({
				json: vi.fn().mockResolvedValue(mockResponse)
			} as any);

			await notesApi.readNote('abc123');

			expect(ky.post).toHaveBeenCalledWith('/api/notes/abc123/read', {
				json: {},
				timeout: 30000
			});
		});

		it('should handle read errors', async () => {
			vi.mocked(ky.post).mockReturnValue({
				json: vi.fn().mockRejectedValue(new Error('Note not found'))
			} as any);

			await expect(notesApi.readNote('invalid-link')).rejects.toThrow('Note not found');
		});
	});

	describe('checkNoteStatus', () => {
		it('should check note status successfully', async () => {
			const mockResponse = {
				exists: true,
				isRead: false,
				hasPassword: true
			};

			vi.mocked(ky.get).mockReturnValue({
				json: vi.fn().mockResolvedValue(mockResponse)
			} as any);

			const result = await notesApi.checkNoteStatus('abc123');

			expect(result).toEqual(mockResponse);
			expect(ky.get).toHaveBeenCalledWith('/api/notes/abc123/status', {
				timeout: 30000
			});
		});

		it('should handle status check errors', async () => {
			vi.mocked(ky.get).mockReturnValue({
				json: vi.fn().mockRejectedValue(new Error('Note not found'))
			} as any);

			await expect(notesApi.checkNoteStatus('invalid')).rejects.toThrow('Note not found');
		});
	});

	describe('destroyNote', () => {
		it('should destroy a note successfully', async () => {
			const mockResponse = {
				success: true,
				message: 'Note destroyed'
			};

			vi.mocked(ky.delete).mockReturnValue({
				json: vi.fn().mockResolvedValue(mockResponse)
			} as any);

			const result = await notesApi.destroyNote('abc123');

			expect(result).toEqual(mockResponse);
			expect(ky.delete).toHaveBeenCalledWith('/api/notes/abc123', {
				timeout: 30000
			});
		});

		it('should handle destroy errors', async () => {
			vi.mocked(ky.delete).mockReturnValue({
				json: vi.fn().mockRejectedValue(new Error('Failed to destroy'))
			} as any);

			await expect(notesApi.destroyNote('abc123')).rejects.toThrow('Failed to destroy');
		});
	});

	describe('destroyNoteByDeleteLink', () => {
		it('should destroy a note by delete link successfully', async () => {
			const mockResponse = {
				success: true,
				message: 'Note destroyed'
			};

			vi.mocked(ky.delete).mockReturnValue({
				json: vi.fn().mockResolvedValue(mockResponse)
			} as any);

			const result = await notesApi.destroyNoteByDeleteLink('delete-abc123');

			expect(result).toEqual(mockResponse);
			expect(ky.delete).toHaveBeenCalledWith('/api/notes/delete/delete-abc123', {
				timeout: 30000
			});
		});

		it('should handle destroy by delete link errors', async () => {
			vi.mocked(ky.delete).mockReturnValue({
				json: vi.fn().mockRejectedValue(new Error('Invalid delete link'))
			} as any);

			await expect(notesApi.destroyNoteByDeleteLink('invalid')).rejects.toThrow(
				'Invalid delete link'
			);
		});
	});
});
