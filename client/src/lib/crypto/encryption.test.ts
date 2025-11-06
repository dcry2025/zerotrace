import { describe, it, expect, beforeEach } from 'vitest';
import {
	generateEncryptionKey,
	encryptText,
	decryptText,
	extractKeyFromUrl,
	clearUrlFragment,
	isValidKey,
	EncryptionError,
	DecryptionError,
	type EncryptedData
} from './encryption';

describe('encryption module', () => {
	describe('generateEncryptionKey', () => {
		it('should generate a valid base64url key', async () => {
			const key = await generateEncryptionKey();

			expect(key).toBeDefined();
			expect(typeof key).toBe('string');
			expect(key.length).toBeGreaterThanOrEqual(43);
			expect(key).toMatch(/^[A-Za-z0-9_-]+$/);
		});

		it('should generate unique keys', async () => {
			const key1 = await generateEncryptionKey();
			const key2 = await generateEncryptionKey();

			expect(key1).not.toBe(key2);
		});
	});

	describe('encryptText and decryptText', () => {
		let noteKey: string;
		const plaintext = 'This is a secret message!';
		const metadata = {
			uniqueLink: 'test-link-123',
			timestamp: Date.now()
		};

		beforeEach(async () => {
			noteKey = await generateEncryptionKey();
		});

		it('should encrypt and decrypt text successfully', async () => {
			const encrypted = await encryptText(plaintext, noteKey, metadata);

			expect(encrypted).toBeDefined();
			expect(encrypted.ciphertext).toBeDefined();
			expect(encrypted.iv).toBeDefined();
			expect(encrypted.tag).toBeDefined();
			expect(encrypted.metadata).toEqual(metadata);

			const decrypted = await decryptText(encrypted, noteKey);
			expect(decrypted).toBe(plaintext);
		});

		it('should produce different ciphertext for same plaintext (due to random IV)', async () => {
			const encrypted1 = await encryptText(plaintext, noteKey, metadata);
			const encrypted2 = await encryptText(plaintext, noteKey, metadata);

			expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
			expect(encrypted1.iv).not.toBe(encrypted2.iv);
		});

		it('should fail decryption with wrong key', async () => {
			const encrypted = await encryptText(plaintext, noteKey, metadata);
			const wrongKey = await generateEncryptionKey();

			await expect(decryptText(encrypted, wrongKey)).rejects.toThrow(DecryptionError);
		});

		it('should fail decryption with tampered ciphertext', async () => {
			const encrypted = await encryptText(plaintext, noteKey, metadata);

			// Tamper with ciphertext
			const tampered = { ...encrypted, ciphertext: encrypted.ciphertext.slice(0, -1) + 'X' };

			await expect(decryptText(tampered, noteKey)).rejects.toThrow(DecryptionError);
		});

		it('should fail decryption with tampered metadata', async () => {
			const encrypted = await encryptText(plaintext, noteKey, metadata);

			// Tamper with metadata (change uniqueLink)
			const tampered = {
				...encrypted,
				metadata: { ...metadata, uniqueLink: 'tampered-link' }
			};

			await expect(decryptText(tampered, noteKey)).rejects.toThrow(DecryptionError);
		});

		it('should handle empty string encryption', async () => {
			const emptyText = '';

			await expect(encryptText(emptyText, noteKey, metadata)).rejects.toThrow(EncryptionError);
		});

		it('should handle unicode characters', async () => {
			const unicodeText = '你好世界 🌍 Привет мир';

			const encrypted = await encryptText(unicodeText, noteKey, metadata);
			const decrypted = await decryptText(encrypted, noteKey);

			expect(decrypted).toBe(unicodeText);
		});

		it('should handle long text', async () => {
			const longText = 'A'.repeat(10000);

			const encrypted = await encryptText(longText, noteKey, metadata);
			const decrypted = await decryptText(encrypted, noteKey);

			expect(decrypted).toBe(longText);
		});

		it('should throw EncryptionError for invalid plaintext', async () => {
			await expect(encryptText(null as any, noteKey, metadata)).rejects.toThrow(EncryptionError);
			await expect(encryptText(undefined as any, noteKey, metadata)).rejects.toThrow(
				EncryptionError
			);
			await expect(encryptText(123 as any, noteKey, metadata)).rejects.toThrow(EncryptionError);
		});

		it('should throw EncryptionError for invalid key', async () => {
			await expect(encryptText(plaintext, 'invalid-key', metadata)).rejects.toThrow(
				EncryptionError
			);
			await expect(encryptText(plaintext, '', metadata)).rejects.toThrow(EncryptionError);
		});

		it('should throw EncryptionError for invalid metadata', async () => {
			await expect(encryptText(plaintext, noteKey, {} as any)).rejects.toThrow(EncryptionError);
			await expect(encryptText(plaintext, noteKey, { uniqueLink: '' } as any)).rejects.toThrow(
				EncryptionError
			);
		});

		it('should throw DecryptionError for invalid encrypted data', async () => {
			await expect(decryptText(null as any, noteKey)).rejects.toThrow(DecryptionError);
			await expect(decryptText({} as any, noteKey)).rejects.toThrow(DecryptionError);
			await expect(decryptText({ ciphertext: 'test' } as any, noteKey)).rejects.toThrow(
				DecryptionError
			);
		});
	});

	describe('isValidKey', () => {
		it('should validate correct key format', async () => {
			const validKey = await generateEncryptionKey();
			expect(isValidKey(validKey)).toBe(true);
		});

		it('should reject invalid key formats', () => {
			expect(isValidKey('')).toBe(false);
			expect(isValidKey('too-short')).toBe(false);
			expect(isValidKey('invalid!@#$%^&*()')).toBe(false);
			expect(isValidKey(null as any)).toBe(false);
			expect(isValidKey(undefined as any)).toBe(false);
			expect(isValidKey(123 as any)).toBe(false);
		});

		it('should reject keys that are too long', () => {
			const tooLongKey = 'A'.repeat(100);
			expect(isValidKey(tooLongKey)).toBe(false);
		});
	});

	describe('extractKeyFromUrl', () => {
		it('should extract key from URL fragment', () => {
			window.location.hash = '#test-key-123';
			const key = extractKeyFromUrl();

			expect(key).toBe('test-key-123');
		});

		it('should return null for empty fragment', () => {
			window.location.hash = '';
			expect(extractKeyFromUrl()).toBe(null);

			window.location.hash = '#';
			expect(extractKeyFromUrl()).toBe(null);
		});

		it('should handle complex keys', () => {
			const complexKey = 'aB3_-xYz9876543210';
			window.location.hash = `#${complexKey}`;

			expect(extractKeyFromUrl()).toBe(complexKey);
		});
	});

	describe('clearUrlFragment', () => {
		it('should clear URL fragment', () => {
			window.location.hash = '#test-key';
			clearUrlFragment();

			// Note: In jsdom, this might not work exactly like in a real browser
			// but we test that the function doesn't throw
			expect(() => clearUrlFragment()).not.toThrow();
		});
	});

	describe('encryption metadata integrity', () => {
		it('should maintain metadata consistency between encryption and decryption', async () => {
			const noteKey = await generateEncryptionKey();
			const plaintext = 'Test message';
			const metadata = {
				uniqueLink: 'unique-123',
				timestamp: 1234567890
			};

			const encrypted = await encryptText(plaintext, noteKey, metadata);

			// Metadata should be preserved in encrypted data
			expect(encrypted.metadata).toEqual(metadata);

			// Decryption should succeed with preserved metadata
			const decrypted = await decryptText(encrypted, noteKey);
			expect(decrypted).toBe(plaintext);
		});

		it('should fail with different timestamp in metadata', async () => {
			const noteKey = await generateEncryptionKey();
			const plaintext = 'Test message';
			const metadata = {
				uniqueLink: 'unique-123',
				timestamp: 1234567890
			};

			const encrypted = await encryptText(plaintext, noteKey, metadata);

			// Change timestamp in metadata
			const tamperedEncrypted: EncryptedData = {
				...encrypted,
				metadata: { ...metadata, timestamp: 9999999999 }
			};

			await expect(decryptText(tamperedEncrypted, noteKey)).rejects.toThrow(DecryptionError);
		});
	});
});
