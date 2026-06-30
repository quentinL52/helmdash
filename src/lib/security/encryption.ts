import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

/**
 * Derive a 256-bit key from a password and salt using PBKDF2.
 */
export function deriveKey(password: string, salt: Buffer): Buffer {
  // Using PBKDF2 with 100,000 iterations for secure key derivation
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * Generate a random salt.
 */
export function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * Encrypt a buffer or string using AES-256-GCM.
 * @param text The plain text to encrypt.
 * @param key The 32-byte encryption key.
 * @returns An object containing the IV, encrypted data, and authentication tag.
 */
export function encrypt(text: string | Buffer, key: Buffer): { iv: string; content: string; tag: string } {
  if (key.length !== KEY_LENGTH) {
    throw new Error('Invalid key length. Must be 32 bytes.');
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const bufferText = typeof text === 'string' ? Buffer.from(text, 'utf8') : text;
  
  let encrypted = cipher.update(bufferText);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
  };
}

/**
 * Decrypt a buffer or string using AES-256-GCM.
 * @param encryptedData Object containing the IV, encrypted content, and authentication tag.
 * @param key The 32-byte encryption key.
 * @returns The decrypted text as a Buffer.
 */
export function decrypt(encryptedData: { iv: string; content: string; tag: string }, key: Buffer): Buffer {
  if (key.length !== KEY_LENGTH) {
    throw new Error('Invalid key length. Must be 32 bytes.');
  }
  
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const content = Buffer.from(encryptedData.content, 'hex');
  const tag = Buffer.from(encryptedData.tag, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(content);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted;
}

/**
 * Decrypt to a UTF-8 string.
 */
export function decryptToString(encryptedData: { iv: string; content: string; tag: string }, key: Buffer): string {
  return decrypt(encryptedData, key).toString('utf8');
}
