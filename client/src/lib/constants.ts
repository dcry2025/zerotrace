/**
 * Application-wide constants
 */

/**
 * Social media and contact information
 * These are public contacts and don't need to be in env variables
 */
export const CONTACTS = {
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

/**
 * Public URL configuration
 */
export const PUBLIC_URL = 'http://zerotrace.work';

/**
 * Cryptocurrency donation addresses
 */
export const CRYPTO_DONATIONS = {
  BTC: 'bc1qzxvdxp4qpw52pqepvlejquucefjta09kh2nk0v',
  ETH: '0x977baf7DFf0C1649F579d3DF3BAD83D0D834367E',
} as const;

