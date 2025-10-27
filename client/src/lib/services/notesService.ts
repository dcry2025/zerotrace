// src/services/notesService.ts

import { notesApi, type CreateNoteDto, type CreateNoteResponseDto, type ReadNoteResponseDto, type NoteStatusResponseDto } from '$lib/api/notesApi';
import { 
  generateEncryptionKey, 
  encryptText, 
  decryptText,
  EncryptionError,
  DecryptionError,
  type EncryptedData 
} from '$lib/crypto/encryption';
import { encryptKeyForAdmin, RSAEncryptionError } from '$lib/crypto/rsa';

// Re-export types from API for convenience
export type { CreateNoteDto, CreateNoteResponseDto, ReadNoteResponseDto, NoteStatusResponseDto };

/**
 * Extended create note data with plaintext content
 */
interface CreateNoteInput {
  content: string;
  password?: string;
  expiresInDays?: number;
  notifyOnRead?: boolean;
  telegramUsername?: string;
}

/**
 * Create note response with noteKey for URL
 */
interface CreateNoteResult {
  uniqueLink: string;
  deleteLink: string;
  noteKey: string;
  message: string;
}

const notesService = {
  /**
   * Create a new secure note with AES-256-GCM + RSA-4096 encryption
   * 
   * Process:
   * 1. Generate random noteKey (AES-256)
   * 2. Encrypt content with noteKey (AES-GCM + AAD)
   * 3. Encrypt noteKey with admin public key (RSA-OAEP)
   * 4. Send encrypted data to server
   * 5. Return uniqueLink and noteKey for URL fragment
   * 
   * @param data - Note data (plaintext content, password, etc.)
   * @returns { uniqueLink, noteKey, message }
   */
  createNote: async (data: CreateNoteInput): Promise<CreateNoteResult> => {
    try {
      // 1. Generate random 256-bit encryption key
      const noteKey = await generateEncryptionKey();
      
      // 2. Generate cryptographically random temporary uniqueLink for AAD
      // This will be preserved in the encrypted content's metadata
      const tempBytes = new Uint8Array(8);
      crypto.getRandomValues(tempBytes);
      const tempUniqueLink = Array.from(tempBytes, b => b.toString(16).padStart(2, '0')).join('');
      
      // 3. Use single timestamp for both AAD and metadata consistency
      const timestamp = Date.now();
      
      // 4. Encrypt content using AES-256-GCM with AAD
      const encrypted = await encryptText(
        data.content,
        noteKey,
        {
          uniqueLink: tempUniqueLink,
          timestamp: timestamp
        }
      );
      
      // 5. Encrypt noteKey for admin using RSA-4096
      const publicKey = import.meta.env.VITE_MASTER_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('Master public key not configured. Run: node scripts/generate-master-key.js');
      }
      
      const encryptedKeyForAdmin = await encryptKeyForAdmin(noteKey, publicKey);
      
      // 6. Send encrypted data to server
      // IMPORTANT: Server must store the encrypted content WITHOUT modifying metadata!
      const response = await notesApi.createNote({
        content: JSON.stringify(encrypted), // Encrypted content as JSON string (with temp uniqueLink in metadata)
        encryptedKeyForAdmin: encryptedKeyForAdmin, // For admin decryption
        password: data.password,
        expiresInDays: data.expiresInDays,
        notifyOnRead: data.notifyOnRead,
        telegramUsername: data.telegramUsername
      });
      
      // 7. Return response with noteKey (for URL fragment)
      return {
        uniqueLink: response.uniqueLink, // Real server-generated ID for URL path
        deleteLink: response.deleteLink, // Delete link for destroying the note
        noteKey: noteKey, // Client keeps this for URL fragment (#key)
        message: response.message
      };
    } catch (error: any) {
      console.error('createNote error:', error);
      
      // Provide user-friendly error messages
      if (error instanceof EncryptionError) {
        throw new Error(`Encryption failed: ${error.message}`);
      }
      if (error instanceof RSAEncryptionError) {
        throw new Error(`Admin key encryption failed: ${error.message}`);
      }
      
      // Re-throw original error for other cases
      throw error;
    }
  },

  /**
   * Read a note and decrypt it using noteKey from URL fragment
   * 
   * Process:
   * 1. Request encrypted content from server (with password if needed)
   * 2. Parse encrypted data (ciphertext, iv, tag, metadata)
   * 3. Decrypt using noteKey (AES-GCM + AAD verification)
   * 4. Return decrypted plaintext
   * 
   * @param uniqueLink - Note unique link
   * @param noteKey - Decryption key (from URL fragment)
   * @param password - Optional password for protected notes
   * @returns { content }
   */
  readNote: async (uniqueLink: string, noteKey: string, password?: string): Promise<ReadNoteResponseDto> => {
    try {
      // 1. Request encrypted content from server
      const response = await notesApi.readNote(uniqueLink, password ? { password } : undefined);
      
      // 2. Parse encrypted data JSON
      let encrypted: EncryptedData;
      try {
        encrypted = JSON.parse(response.content);
      } catch (parseError) {
        throw new Error('Invalid encrypted data format received from server');
      }
      
      // 3. Validate encrypted data structure
      if (!encrypted.ciphertext || !encrypted.iv || !encrypted.tag || !encrypted.metadata) {
        throw new Error('Encrypted data is missing required fields');
      }
      
      // 4. Decrypt content using noteKey
      // NOTE: AAD will be verified against encrypted.metadata (which contains the temp uniqueLink from encryption time)
      const decryptedContent = await decryptText(encrypted, noteKey);
      
      // 5. Return decrypted note
      return {
        content: decryptedContent,
      };
    } catch (error: any) {
      console.error('readNote error:', error);
      
      // Provide specific error messages for different failure types
      if (error instanceof DecryptionError) {
        throw new Error('Failed to decrypt note: Invalid encryption key, corrupted data, or tampered content.');
      }
      
      if (error.message?.includes('Invalid encrypted data')) {
        throw error; // Already has good message
      }
      
      // Re-throw original error for API/network errors
      throw error;
    }
  },

  /**
   * Check note status without reading it
   * Returns: { exists, isRead, hasPassword }
   */
  checkNoteStatus: async (uniqueLink: string): Promise<NoteStatusResponseDto> => {
    try {
      return await notesApi.checkNoteStatus(uniqueLink);
    } catch (error: any) {
      console.error('checkNoteStatus error:', error);
      throw error;
    }
  }
};

export default notesService;
