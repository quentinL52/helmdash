/**
 * Helmdash — API Key Masking Utility
 *
 * Masks API keys in logs and error messages to prevent accidental exposure.
 *
 * Usage:
 * ```ts
 * import { maskKey } from '@/lib/security/mask-key';
 * console.log('API Key:', maskKey(apiKey)); // "sk-...aB3c"
 * ```
 */

/**
 * Masks the middle portion of an API key, keeping only the prefix and last 4 chars.
 * If the key is shorter than 12 chars, masks everything except the last 4.
 *
 * Examples:
 * - "sk-proj-abc123def456" → "sk-proj-...f456"
 * - "sk-ant-abc123def456" → "sk-ant-...f456"
 * - "short" → "****"
 */
export function maskKey(key: string | null | undefined): string {
  if (!key || key.length < 6) return '****';

  const prefix = key.length > 12 ? key.slice(0, 7) : key.slice(0, 4);
  const suffix = key.slice(-4);

  return `${prefix}...${suffix}`;
}

/**
 * Redacts any string that looks like an API key from a log message.
 * Matches common API key patterns: sk-*, pk-*, whsec_*, etc.
 */
export function redactKeys(text: string): string {
  return text.replace(
    /(sk-|pk-|sk-ant-|whsec_|ghp_|gho_|ghu_|ghs_|ghr_|re_)[a-zA-Z0-9_-]{20,}/g,
    (match) => maskKey(match),
  );
}