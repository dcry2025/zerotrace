/**
 * SvelteKit Server Hooks
 * 
 * Adds security headers to all responses
 */

import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Content Security Policy (CSP)
  // Prevents XSS attacks and controls what resources can be loaded
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // 'unsafe-inline' needed for Svelte
      "style-src 'self' 'unsafe-inline'",  // 'unsafe-inline' needed for component styles
      "img-src 'self' data: https:",       // Allow images from self, data URIs, and HTTPS
      "font-src 'self' data:",             // Allow fonts from self and data URIs
      "connect-src 'self' http://localhost:7000 https:", // Allow API connections
      "object-src 'none'",                 // Disallow plugins (Flash, etc.)
      "base-uri 'self'",                   // Restrict base tag URLs
      "frame-ancestors 'none'",            // Prevent clickjacking (no embedding)
      "form-action 'self'",                // Restrict form submissions
      "upgrade-insecure-requests"          // Upgrade HTTP to HTTPS
    ].join('; ')
  );

  // HTTP Strict Transport Security (HSTS)
  // Forces browsers to use HTTPS connections
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Referrer Policy
  // CRITICAL: 'no-referrer' prevents URL fragments (encryption keys) from leaking
  response.headers.set('Referrer-Policy', 'no-referrer');

  // X-Content-Type-Options
  // Prevents MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  // Additional protection against clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // X-XSS-Protection
  // Legacy XSS protection (mostly replaced by CSP)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Permissions Policy
  // Controls browser features
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  return response;
};

