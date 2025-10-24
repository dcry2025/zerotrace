/**
 * Crypto Module Exports
 * 
 * Provides all encryption functionality:
 * - AES-256-GCM for note content
 * - RSA-4096 for admin key encryption
 * - URL fragment handling
 */

// AES-256-GCM encryption
export {
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

// RSA-4096 encryption
export {
  encryptKeyForAdmin,
  decryptKeyForAdmin,
  isValidPublicKey,
  RSAEncryptionError,
  RSADecryptionError
} from './rsa';

