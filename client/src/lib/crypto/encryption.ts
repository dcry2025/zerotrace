/**
 * AES-256-GCM Encryption Module
 * 
 * Provides symmetric encryption for note content using Web Crypto API
 * - AES-256-GCM with random IV
 * - Additional Authenticated Data (AAD) for integrity
 * - Base64url encoding for URL-safe keys
 */

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
  metadata: {
    uniqueLink: string;
    timestamp: number;
  };
}

/**
 * Custom encryption errors for better error handling
 */
export class EncryptionError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'EncryptionError';
  }
}

export class DecryptionError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'DecryptionError';
  }
}

/**
 * Generate a random 256-bit encryption key
 * @returns Base64url-encoded key string
 */
export async function generateEncryptionKey(): Promise<string> {
  const key = new Uint8Array(32); // 256 bits
  crypto.getRandomValues(key);
  return base64urlEncode(key);
}

/**
 * Encrypt plaintext using AES-256-GCM
 * @param plaintext - Text to encrypt
 * @param noteKey - Base64url-encoded 256-bit key
 * @param metadata - Additional data for AAD (uniqueLink, timestamp)
 * @returns Encrypted data with IV and tag
 * @throws {EncryptionError} If encryption fails
 */
export async function encryptText(
  plaintext: string,
  noteKey: string,
  metadata: { uniqueLink: string; timestamp: number }
): Promise<EncryptedData> {
  try {
    // Validate inputs
    if (!plaintext || typeof plaintext !== 'string') {
      throw new EncryptionError('Invalid plaintext: must be a non-empty string');
    }
    if (!isValidKey(noteKey)) {
      throw new EncryptionError('Invalid encryption key format');
    }
    if (!metadata?.uniqueLink || !metadata?.timestamp) {
      throw new EncryptionError('Invalid metadata: uniqueLink and timestamp are required');
    }
    
    // Decode key from base64url
    const keyData = base64urlDecode(noteKey);
    
    // Import key for AES-GCM
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData as BufferSource,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // Generate random IV (12 bytes for GCM)
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    
    // Prepare AAD with deterministic serialization (порядок ключей важен!)
    const aad = stringToUint8Array(serializeMetadata(metadata));
    
    // Encrypt
    const plaintextBytes = stringToUint8Array(plaintext);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
        additionalData: aad as BufferSource,
        tagLength: 128 // 16 bytes authentication tag
      },
      cryptoKey,
      plaintextBytes as BufferSource
    );
    
    // Split ciphertext and tag (last 16 bytes)
    const encryptedArray = new Uint8Array(encrypted);
    const ciphertext = encryptedArray.slice(0, -16);
    const tag = encryptedArray.slice(-16);
    
    return {
      ciphertext: base64urlEncode(ciphertext),
      iv: base64urlEncode(iv),
      tag: base64urlEncode(tag),
      metadata
    };
  } catch (error) {
    // Handle specific Web Crypto API errors
    if (error instanceof EncryptionError) {
      throw error;
    }
    if (error instanceof DOMException) {
      if (error.name === 'OperationError') {
        throw new EncryptionError('Encryption operation failed: Invalid key or data', error);
      }
      if (error.name === 'InvalidAccessError') {
        throw new EncryptionError('Invalid access to crypto API', error);
      }
    }
    throw new EncryptionError(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`, error);
  }
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param encrypted - Encrypted data object
 * @param noteKey - Base64url-encoded 256-bit key
 * @returns Decrypted plaintext
 * @throws {DecryptionError} If decryption fails (wrong key, corrupted data, etc.)
 */
export async function decryptText(
  encrypted: EncryptedData,
  noteKey: string
): Promise<string> {
  try {
    // Validate inputs
    if (!encrypted || typeof encrypted !== 'object') {
      throw new DecryptionError('Invalid encrypted data: must be an object');
    }
    if (!encrypted.ciphertext || !encrypted.iv || !encrypted.tag) {
      throw new DecryptionError('Invalid encrypted data: missing required fields');
    }
    if (!isValidKey(noteKey)) {
      throw new DecryptionError('Invalid decryption key format');
    }
    if (!encrypted.metadata?.uniqueLink || !encrypted.metadata?.timestamp) {
      throw new DecryptionError('Invalid metadata in encrypted data');
    }
    
    // Decode key from base64url
    const keyData = base64urlDecode(noteKey);
    
    // Import key for AES-GCM
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData as BufferSource,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decode encrypted data
    const ciphertext = base64urlDecode(encrypted.ciphertext);
    const iv = base64urlDecode(encrypted.iv);
    const tag = base64urlDecode(encrypted.tag);
    
    // Combine ciphertext and tag
    const combined = new Uint8Array(ciphertext.length + tag.length);
    combined.set(ciphertext, 0);
    combined.set(tag, ciphertext.length);
    
    // Prepare AAD with deterministic serialization (должен совпадать с encrypt!)
    const aad = stringToUint8Array(serializeMetadata(encrypted.metadata));
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
        additionalData: aad as BufferSource,
        tagLength: 128
      },
      cryptoKey,
      combined as BufferSource
    );
    
    return uint8ArrayToString(new Uint8Array(decrypted));
  } catch (error) {
    // Handle specific Web Crypto API errors
    if (error instanceof DecryptionError) {
      throw error;
    }
    if (error instanceof DOMException) {
      if (error.name === 'OperationError') {
        throw new DecryptionError('Decryption failed: Invalid key, corrupted data, or tampered metadata', error);
      }
      if (error.name === 'InvalidAccessError') {
        throw new DecryptionError('Invalid access to crypto API', error);
      }
    }
    throw new DecryptionError(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`, error);
  }
}

/**
 * Extract encryption key from URL fragment (#key)
 * @returns Key string or null if not found
 */
export function extractKeyFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const fragment = window.location.hash;
  if (!fragment || fragment.length <= 1) return null;
  
  return fragment.slice(1); // Remove '#'
}

/**
 * Clear URL fragment (remove key from URL)
 * Note: This function can be called from browser context only
 * For SvelteKit integration, use replaceState from $app/navigation in the component
 */
export function clearUrlFragment(): void {
  if (typeof window === 'undefined') return;
  
  const url = window.location.href.split('#')[0];
  // Use native API here since this is a utility function
  // Component should use SvelteKit's replaceState if needed
  window.history.replaceState(null, '', url);
}

/**
 * Validate encryption key format
 * @param key - Key to validate
 * @returns true if valid base64url string with correct length
 */
export function isValidKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  
  // Base64url pattern: alphanumeric, dash, underscore
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  // 256-bit key = 32 bytes = 43 base64url characters (without padding)
  // Allow exact 43 chars or slightly more for flexibility (max 64 bytes = 86 chars)
  return base64urlPattern.test(key) && key.length >= 43 && key.length <= 86;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Serialize metadata deterministically for AAD
 * CRITICAL: порядок ключей должен быть одинаковым при encrypt и decrypt!
 * JSON.stringify не гарантирует порядок ключей, поэтому мы явно его указываем.
 * 
 * @param metadata - Metadata object
 * @returns JSON string with guaranteed key order
 */
function serializeMetadata(metadata: { uniqueLink: string; timestamp: number }): string {
  // Явный порядок ключей: uniqueLink, затем timestamp
  return JSON.stringify({
    uniqueLink: metadata.uniqueLink,
    timestamp: metadata.timestamp
  });
}

/**
 * Encode Uint8Array to base64url (URL-safe, no padding)
 */
function base64urlEncode(data: Uint8Array): string {
  // Convert to binary string in chunks to avoid call stack limit
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decode base64url string to Uint8Array
 * @throws {Error} If base64url string is invalid
 */
function base64urlDecode(str: string): Uint8Array {
  try {
    // Add padding if needed
    const padded = str + '=='.slice(0, (4 - str.length % 4) % 4);
    
    // Convert base64url to base64
    const base64 = padded
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Decode (atob can throw DOMException)
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    throw new Error(`Invalid base64url string: ${error instanceof Error ? error.message : 'decode failed'}`);
  }
}

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

