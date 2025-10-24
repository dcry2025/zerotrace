/**
 * Application-wide constants
 */

/**
 * Social media and contact information
 * These are public contacts and don't need to be in env variables
 */
export const CONTACTS = {
  TWITTER: {
    username: 'zerotrace_work',
    url: 'https://twitter.com/zerotrace_work',
  },
  TELEGRAM: {
    username: 'zerotrace_work',
    url: 'https://t.me/zerotrace_work',
  },
} as const;

/**
 * Application metadata
 */
export const APP_INFO = {
  NAME: 'zerotrace',
  DESCRIPTION: 'Secure Private Notes - End-to-End Encrypted Self-Destructing Messages',
  VERSION: '0.0.1',
} as const;

/**
 * Note expiration options (in hours)
 */
export const NOTE_EXPIRATION_OPTIONS = [
  { label: '1 hour from now', value: 1 },
  { label: '24 hours from now', value: 24 },
  { label: '7 days from now', value: 168 },
  { label: '30 days from now', value: 720 },
] as const;

/**
 * Password validation constants
 */
export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
} as const;

