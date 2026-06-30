import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Dérive une clé de chiffrement à partir du mot de passe utilisateur + salt stocké
 * Utilise scrypt (KDF résistant au brute-force)
 */
export async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return (await scryptAsync(password, salt, 32)) as Buffer;
}

/**
 * Chiffre une donnée avec AES-256-GCM (authentifié)
 * Retourne: iv + ciphertext + authTag (concaténés)
 */
export async function encrypt(plaintext: string, key: Buffer): Promise<string> {
  const iv = randomBytes(12); // 96 bits pour GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv (12) + ciphertext + authTag (16)
  const result = Buffer.concat([iv, ciphertext, authTag]);
  return result.toString('base64');
}

/**
 * Déchiffre une donnée chiffrée avec encrypt()
 */
export async function decrypt(encryptedData: string, key: Buffer): Promise<string> {
  const buffer = Buffer.from(encryptedData, 'base64');
  
  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(buffer.length - 16);
  const ciphertext = buffer.subarray(12, buffer.length - 16);
  
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);
  
  return plaintext.toString('utf8');
}

/**
 * Génère un salt aléatoire pour la dérivation de clé
 */
export function generateSalt(): Buffer {
  return randomBytes(16);
}

/**
 * Vérifie si une chaîne est un UUID valide (v4)
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitise un identifiant pour usage en base (UUID seulement)
 */
export function sanitizeUserId(userId: string): string {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid userId format');
  }
  return userId.toLowerCase();
}