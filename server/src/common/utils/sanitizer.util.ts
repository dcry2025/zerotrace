// src/common/utils/sanitizer.util.ts

import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Strips all HTML tags and returns plain text
 */
export function sanitizeContent(content: string): string {
  if (!content) {
    return '';
  }

  // Remove all HTML tags completely - we only allow plain text
  return sanitizeHtml(content, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}, // No attributes allowed
    disallowedTagsMode: 'discard', // Remove disallowed tags completely
    textFilter: (text: string) => {
      // Additional text sanitization if needed
      return text;
    },
  });
}

/**
 * Sanitize user agent string
 * Remove potentially dangerous characters
 */
export function sanitizeUserAgent(userAgent: string | undefined): string {
  if (!userAgent || userAgent.trim().length === 0) {
    return 'Unknown';
  }

  // Remove HTML tags and limit length
  const sanitized = sanitizeHtml(userAgent, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });

  // Limit length to prevent extremely long strings
  return sanitized.substring(0, 500);
}

/**
 * Sanitize IP address
 * Validate and clean IP address format
 */
export function sanitizeIpAddress(ip: string | undefined): string {
  if (!ip) {
    return 'Unknown';
  }

  // Basic IPv4/IPv6 validation and sanitization
  // Remove any HTML tags first
  const cleanIp = sanitizeHtml(ip, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  }).trim();

  // Limit length first
  if (cleanIp.length > 45) {
    return 'Invalid IP';
  }

  // IPv4 pattern: xxx.xxx.xxx.xxx
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^[0-9a-fA-F:]+$/;

  if (ipv4Pattern.test(cleanIp) || ipv6Pattern.test(cleanIp)) {
    return cleanIp;
  }

  // If doesn't match IP pattern, return safe fallback
  return 'Invalid IP';
}

/**
 * Validate content length
 */
export function validateContentLength(
  content: string,
  maxLength: number = 50000,
): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }
  return content.length > 0 && content.length <= maxLength;
}
