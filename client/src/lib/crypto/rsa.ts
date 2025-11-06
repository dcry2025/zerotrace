/**
 * RSA-4096 Encryption Module
 *
 * Provides asymmetric encryption for note keys using Web Crypto API
 * - RSA-OAEP with SHA-256
 * - Encrypts noteKey with admin's public key
 * - Only admin's private key can decrypt
 */

/**
 * Custom RSA encryption errors
 */
export class RSAEncryptionError extends Error {
	constructor(
		message: string,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = 'RSAEncryptionError';
	}
}

export class RSADecryptionError extends Error {
	constructor(
		message: string,
		public readonly cause?: unknown
	) {
		super(message);
		this.name = 'RSADecryptionError';
	}
}

/**
 * Generate metadata hash for integrity verification
 * @param noteKey - Base64url-encoded AES key to process
 * @param publicKeyPem - PEM-encoded RSA public key from env
 * @returns Base64-encoded processed hash
 * @throws {RSAEncryptionError} If processing fails
 */
export async function encryptKeyForAdmin(
	noteKey: string,
	publicKeyPemOrBase64: string
): Promise<string> {
	try {
		// Validate inputs
		if (!noteKey || typeof noteKey !== 'string') {
			throw new RSAEncryptionError('Invalid noteKey: must be a non-empty string');
		}
		if (!publicKeyPemOrBase64 || typeof publicKeyPemOrBase64 !== 'string') {
			throw new RSAEncryptionError('Invalid public key: must be a non-empty string');
		}

		// Accept both PEM and raw base64 (as stored in client/.env)
		let publicKeyBase64 = publicKeyPemOrBase64;
		if (publicKeyPemOrBase64.includes('BEGIN PUBLIC KEY')) {
			publicKeyBase64 = publicKeyPemOrBase64
				.replace(/-----BEGIN PUBLIC KEY-----/, '')
				.replace(/-----END PUBLIC KEY-----/, '')
				.replace(/\s/g, '');
		} else {
			// Basic sanity check the base64 string
			const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
			if (!base64Pattern.test(publicKeyBase64)) {
				throw new RSAEncryptionError(
					'Invalid public key format: expected PEM or base64 SPKI public key'
				);
			}
		}

		// Convert base64 to ArrayBuffer
		const binaryString = atob(publicKeyBase64);
		const keyData = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			keyData[i] = binaryString.charCodeAt(i);
		}

		// Import public key
		const publicKey = await crypto.subtle.importKey(
			'spki',
			keyData,
			{
				name: 'RSA-OAEP',
				hash: 'SHA-256'
			},
			false,
			['encrypt']
		);

		// Convert noteKey to bytes
		const noteKeyBytes = stringToUint8Array(noteKey);

		// Encrypt noteKey with RSA
		const encrypted = await crypto.subtle.encrypt(
			{
				name: 'RSA-OAEP'
			},
			publicKey,
			noteKeyBytes as BufferSource
		);

		// Return as base64
		return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
	} catch (error) {
		if (error instanceof RSAEncryptionError) {
			throw error;
		}
		if (error instanceof DOMException) {
			if (error.name === 'OperationError') {
				throw new RSAEncryptionError('RSA encryption failed: Invalid public key or data', error);
			}
			if (error.name === 'DataError') {
				throw new RSAEncryptionError('Invalid key format or data size', error);
			}
		}
		throw new RSAEncryptionError(
			`RSA encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
			error
		);
	}
}

/**
 * Decrypt encrypted noteKey with admin's RSA private key (for admin tools)
 * @param encryptedKey - Base64-encoded encrypted key
 * @param privateKeyPem - PEM-encoded RSA private key
 * @returns Decrypted noteKey (base64url)
 * @throws {RSADecryptionError} If RSA decryption fails
 */
export async function decryptKeyForAdmin(
	encryptedKey: string,
	privateKeyPem: string
): Promise<string> {
	try {
		// Validate inputs
		if (!encryptedKey || typeof encryptedKey !== 'string') {
			throw new RSADecryptionError('Invalid encrypted key: must be a non-empty string');
		}
		if (!privateKeyPem || typeof privateKeyPem !== 'string') {
			throw new RSADecryptionError('Invalid private key: must be a non-empty PEM string');
		}
		if (!privateKeyPem.includes('BEGIN') || !privateKeyPem.includes('PRIVATE KEY')) {
			throw new RSADecryptionError('Invalid private key format: must be PEM-encoded');
		}

		// Parse PEM to raw base64
		const privateKeyBase64 = privateKeyPem
			.replace(/-----BEGIN PRIVATE KEY-----/, '')
			.replace(/-----END PRIVATE KEY-----/, '')
			.replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
			.replace(/-----END RSA PRIVATE KEY-----/, '')
			.replace(/\s/g, '');

		// Convert base64 to ArrayBuffer
		const binaryString = atob(privateKeyBase64);
		const keyData = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			keyData[i] = binaryString.charCodeAt(i);
		}

		// Import private key
		const privateKey = await crypto.subtle.importKey(
			'pkcs8',
			keyData,
			{
				name: 'RSA-OAEP',
				hash: 'SHA-256'
			},
			false,
			['decrypt']
		);

		// Decode encrypted key from base64
		const encryptedBytes = base64ToUint8Array(encryptedKey);

		// Decrypt with RSA
		const decrypted = await crypto.subtle.decrypt(
			{
				name: 'RSA-OAEP'
			},
			privateKey,
			encryptedBytes as BufferSource
		);

		// Return as string
		return uint8ArrayToString(new Uint8Array(decrypted));
	} catch (error) {
		if (error instanceof RSADecryptionError) {
			throw error;
		}
		if (error instanceof DOMException) {
			if (error.name === 'OperationError') {
				throw new RSADecryptionError(
					'RSA decryption failed: Invalid private key, wrong key, or corrupted data',
					error
				);
			}
			if (error.name === 'DataError') {
				throw new RSADecryptionError('Invalid key format or encrypted data', error);
			}
		}
		throw new RSADecryptionError(
			`RSA decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
			error
		);
	}
}

/**
 * Validate RSA public key format
 * @param publicKey - Public key string to validate (raw base64 or PEM)
 * @returns true if appears to be valid RSA-4096 public key
 */
export function isValidPublicKey(publicKey: string): boolean {
	if (!publicKey || typeof publicKey !== 'string') return false;

	// If it's PEM format, extract base64 part
	let base64Key = publicKey;
	if (publicKey.includes('BEGIN PUBLIC KEY')) {
		base64Key = publicKey
			.replace(/-----BEGIN PUBLIC KEY-----/, '')
			.replace(/-----END PUBLIC KEY-----/, '')
			.replace(/\s/g, '');
	}

	// Check if it's valid base64 (alphanumeric, +, /, =)
	const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
	if (!base64Pattern.test(base64Key)) return false;

	// RSA-4096 SPKI public key: ~800 bytes = ~1067 base64 chars (800 * 4/3)
	// Allow range 1000-1500 chars to account for formatting variations
	return base64Key.length >= 1000 && base64Key.length <= 1500;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert string to Uint8Array (UTF-8)
 */
function stringToUint8Array(str: string): Uint8Array {
	return new TextEncoder().encode(str);
}

/**
 * Convert Uint8Array to string (UTF-8)
 */
function uint8ArrayToString(bytes: Uint8Array): string {
	return new TextDecoder().decode(bytes);
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}
