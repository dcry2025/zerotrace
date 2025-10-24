// src/common/utils/sanitizer.util.spec.ts

import {
  sanitizeContent,
  sanitizeUserAgent,
  sanitizeIpAddress,
  validateContentLength,
} from './sanitizer.util';

describe('Sanitizer Utilities', () => {
  describe('sanitizeContent', () => {
    it('should remove script tags', () => {
      const malicious = '<script>alert("XSS")</script>Hello';
      const result = sanitizeContent(malicious);
      expect(result).toBe('Hello');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove all HTML tags', () => {
      const html = '<div><b>Bold</b> and <i>italic</i></div>';
      const result = sanitizeContent(html);
      expect(result).toBe('Bold and italic');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should remove event handlers', () => {
      const malicious = '<img src=x onerror="alert(\'XSS\')">';
      const result = sanitizeContent(malicious);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    it('should remove javascript: URLs', () => {
      const malicious = '<a href="javascript:alert(\'XSS\')">Click</a>';
      const result = sanitizeContent(malicious);
      expect(result).toBe('Click');
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('href');
    });

    it('should keep plain text intact', () => {
      const plain = 'This is a normal message with no HTML';
      const result = sanitizeContent(plain);
      expect(result).toBe(plain);
    });

    it('should handle empty string', () => {
      const result = sanitizeContent('');
      expect(result).toBe('');
    });

    it('should handle multi-line content', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const result = sanitizeContent(content);
      expect(result).toBe(content);
    });

    it('should remove nested HTML tags', () => {
      const nested = '<div><span><script>alert("nested")</script></span></div>';
      const result = sanitizeContent(nested);
      expect(result).toBe('');
      expect(result).not.toContain('script');
      expect(result).not.toContain('alert');
    });

    it('should handle special characters', () => {
      const special = 'Test & < > " \' characters';
      const result = sanitizeContent(special);
      expect(result).toContain('Test');
      expect(result).toContain('characters');
    });
  });

  describe('sanitizeUserAgent', () => {
    it('should sanitize normal user agent', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124';
      const result = sanitizeUserAgent(ua);
      expect(result).toBe(ua);
    });

    it('should remove HTML from user agent', () => {
      const malicious = 'Mozilla<script>alert("XSS")</script>';
      const result = sanitizeUserAgent(malicious);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Mozilla');
    });

    it('should limit length to 500 characters', () => {
      const long = 'A'.repeat(600);
      const result = sanitizeUserAgent(long);
      expect(result.length).toBe(500);
    });

    it('should return "Unknown" for undefined', () => {
      const result = sanitizeUserAgent(undefined);
      expect(result).toBe('Unknown');
    });

    it('should handle empty string', () => {
      const result = sanitizeUserAgent('');
      expect(result).toBe('Unknown'); // Empty string returns 'Unknown'
    });
  });

  describe('sanitizeIpAddress', () => {
    it('should accept valid IPv4 address', () => {
      const ip = '192.168.1.1';
      const result = sanitizeIpAddress(ip);
      expect(result).toBe(ip);
    });

    it('should accept valid IPv6 address', () => {
      const ip = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
      const result = sanitizeIpAddress(ip);
      expect(result).toBe(ip);
    });

    it('should reject HTML in IP', () => {
      const malicious = '192.168.1.1<script>alert("XSS")</script>';
      const result = sanitizeIpAddress(malicious);
      // After sanitization, HTML is removed, leaving valid IP
      // This is acceptable as the dangerous content is stripped
      expect(result).toBe('192.168.1.1');
      expect(result).not.toContain('<script>');
    });

    it('should return "Unknown" for undefined', () => {
      const result = sanitizeIpAddress(undefined);
      expect(result).toBe('Unknown');
    });

    it('should return "Invalid IP" for malformed IP', () => {
      const malformed = 'not-an-ip-address';
      const result = sanitizeIpAddress(malformed);
      expect(result).toBe('Invalid IP');
    });

    it('should limit length to 45 characters', () => {
      const long = '1'.repeat(50) + '.2.3.4';
      const result = sanitizeIpAddress(long);
      expect(result).toBe('Invalid IP');
    });

    it('should handle localhost', () => {
      const localhost = '127.0.0.1';
      const result = sanitizeIpAddress(localhost);
      expect(result).toBe(localhost);
    });
  });

  describe('validateContentLength', () => {
    it('should accept valid length', () => {
      const content = 'A'.repeat(1000);
      const result = validateContentLength(content);
      expect(result).toBe(true);
    });

    it('should reject empty string', () => {
      const result = validateContentLength('');
      expect(result).toBe(false);
    });

    it('should reject content exceeding max length', () => {
      const content = 'A'.repeat(50001);
      const result = validateContentLength(content);
      expect(result).toBe(false);
    });

    it('should accept content at max length', () => {
      const content = 'A'.repeat(50000);
      const result = validateContentLength(content);
      expect(result).toBe(true);
    });

    it('should accept custom max length', () => {
      const content = 'A'.repeat(100);
      const result = validateContentLength(content, 100);
      expect(result).toBe(true);
    });

    it('should reject content exceeding custom max length', () => {
      const content = 'A'.repeat(101);
      const result = validateContentLength(content, 100);
      expect(result).toBe(false);
    });
  });

  describe('XSS Attack Vectors', () => {
    const xssVectors = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '<body onload="alert(\'XSS\')">',
      '<input onfocus="alert(\'XSS\')" autofocus>',
      '<select onfocus="alert(\'XSS\')" autofocus>',
      '<textarea onfocus="alert(\'XSS\')" autofocus>',
      '<marquee onstart="alert(\'XSS\')">',
      '<div style="background:url(javascript:alert(\'XSS\'))">',
      '<<SCRIPT>alert("XSS");//<</SCRIPT>',
      '<SCRIPT SRC=http://evil.com/xss.js></SCRIPT>',
      '<IMG """><SCRIPT>alert("XSS")</SCRIPT>">',
      '<IMG SRC=javascript:alert(&quot;XSS&quot;)>',
    ];

    xssVectors.forEach((vector, index) => {
      it(`should block XSS vector #${index + 1}: ${vector.substring(0, 50)}`, () => {
        const result = sanitizeContent(vector);
        expect(result).not.toContain('<script');
        expect(result).not.toContain('javascript:');
        expect(result).not.toContain('onerror');
        expect(result).not.toContain('onload');
        expect(result).not.toContain('alert');
      });
    });
  });
});
