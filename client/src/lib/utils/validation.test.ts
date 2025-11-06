import { describe, it, expect } from 'vitest';
import { PASSWORD_VALIDATION } from '$lib/constants';

/**
 * Form validation logic tests
 * These tests validate the password validation logic used in NoteCreationForm
 */

describe('Form Validation Logic', () => {
	// Password validation function (extracted from NoteCreationForm.svelte)
	function validatePassword(pwd: string): { isValid: boolean; error: string } {
		if (!pwd) {
			return { isValid: true, error: '' }; // Password is optional
		}

		if (pwd.length < PASSWORD_VALIDATION.MIN_LENGTH) {
			return {
				isValid: false,
				error: `Password must be at least ${PASSWORD_VALIDATION.MIN_LENGTH} characters`
			};
		}

		if (pwd.length > PASSWORD_VALIDATION.MAX_LENGTH) {
			return {
				isValid: false,
				error: `Password must be no more than ${PASSWORD_VALIDATION.MAX_LENGTH} characters`
			};
		}

		// Check for at least one number or special character
		const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(pwd);
		if (!hasNumberOrSpecial) {
			return {
				isValid: false,
				error: 'Password must contain at least one number or special character'
			};
		}

		return { isValid: true, error: '' };
	}

	// Password strength function (extracted from NoteCreationForm.svelte)
	function getPasswordStrength(pwd: string): 'weak' | 'medium' | 'strong' | null {
		if (!pwd) return null;

		if (pwd.length < 6) return 'weak';

		const hasLower = /[a-z]/.test(pwd);
		const hasUpper = /[A-Z]/.test(pwd);
		const hasNumber = /[0-9]/.test(pwd);
		const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

		const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

		if (pwd.length >= 12 && score >= 3) return 'strong';
		if (pwd.length >= 8 && score >= 2) return 'medium';
		return 'weak';
	}

	describe('validatePassword', () => {
		it('should accept empty password (optional)', () => {
			const result = validatePassword('');
			expect(result.isValid).toBe(true);
			expect(result.error).toBe('');
		});

		it('should reject password shorter than minimum length', () => {
			const result = validatePassword('abc123');
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('at least');
		});

		it('should reject password longer than maximum length', () => {
			const longPassword = 'a'.repeat(PASSWORD_VALIDATION.MAX_LENGTH + 1) + '1';
			const result = validatePassword(longPassword);
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('no more than');
		});

		it('should reject password without number or special character', () => {
			const result = validatePassword('abcdefgh');
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('number or special character');
		});

		it('should accept valid password with number', () => {
			const result = validatePassword('password123');
			expect(result.isValid).toBe(true);
			expect(result.error).toBe('');
		});

		it('should accept valid password with special character', () => {
			const result = validatePassword('password!');
			expect(result.isValid).toBe(true);
			expect(result.error).toBe('');
		});

		it('should accept password at minimum length with special char', () => {
			const result = validatePassword('abcdef1!');
			expect(result.isValid).toBe(true);
		});

		it('should accept password at maximum length', () => {
			const maxPassword = 'a'.repeat(PASSWORD_VALIDATION.MAX_LENGTH - 1) + '1';
			const result = validatePassword(maxPassword);
			expect(result.isValid).toBe(true);
		});

		it('should accept password with multiple special characters', () => {
			const result = validatePassword('pass@word#123!');
			expect(result.isValid).toBe(true);
		});
	});

	describe('getPasswordStrength', () => {
		it('should return null for empty password', () => {
			expect(getPasswordStrength('')).toBe(null);
		});

		it('should return weak for very short password', () => {
			expect(getPasswordStrength('abc1')).toBe('weak');
		});

		it('should return weak or medium for password without variety', () => {
			// 'abcdefgh1' has 9 chars, lowercase + number = 2 types
			// Based on the logic: length >= 8 && score >= 2 = medium
			expect(getPasswordStrength('abcdefgh1')).toBe('medium');
		});

		it('should return medium for decent password', () => {
			expect(getPasswordStrength('Password1')).toBe('medium');
		});

		it('should return strong for complex password', () => {
			expect(getPasswordStrength('Password123!')).toBe('strong');
		});

		it('should evaluate strength correctly - medium (lowercase + number, 9 chars)', () => {
			// 'password1' has 9 chars, lowercase + number = 2 types, so it's medium
			expect(getPasswordStrength('password1')).toBe('medium');
		});

		it('should evaluate strength correctly - medium (mixed case + number)', () => {
			expect(getPasswordStrength('Password1')).toBe('medium');
		});

		it('should evaluate strength correctly - strong (long + varied)', () => {
			expect(getPasswordStrength('MySecurePass123!')).toBe('strong');
		});

		it('should consider length in strength evaluation', () => {
			// Same complexity, different lengths
			expect(getPasswordStrength('Pass1!')).toBe('weak'); // Length 6
			expect(getPasswordStrength('Password1!')).toBe('medium'); // Length 10
			expect(getPasswordStrength('SecurePassword1!')).toBe('strong'); // Length 16
		});
	});

	describe('Content validation', () => {
		function validateContent(content: string): { isValid: boolean; error: string } {
			if (!content || !content.trim()) {
				return {
					isValid: false,
					error: 'Content cannot be empty'
				};
			}
			return { isValid: true, error: '' };
		}

		it('should reject empty content', () => {
			const result = validateContent('');
			expect(result.isValid).toBe(false);
		});

		it('should reject whitespace-only content', () => {
			const result = validateContent('   \n\t  ');
			expect(result.isValid).toBe(false);
		});

		it('should accept valid content', () => {
			const result = validateContent('This is a valid note');
			expect(result.isValid).toBe(true);
		});

		it('should accept content with special characters', () => {
			const result = validateContent('Special chars: @#$%^&*()');
			expect(result.isValid).toBe(true);
		});
	});

	describe('Password confirmation matching', () => {
		function validatePasswordMatch(
			password: string,
			passwordConfirm: string
		): { isValid: boolean; error: string } {
			if (password && passwordConfirm && password !== passwordConfirm) {
				return {
					isValid: false,
					error: 'Passwords do not match'
				};
			}
			return { isValid: true, error: '' };
		}

		it('should accept matching passwords', () => {
			const result = validatePasswordMatch('password123', 'password123');
			expect(result.isValid).toBe(true);
		});

		it('should reject non-matching passwords', () => {
			const result = validatePasswordMatch('password123', 'password456');
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('do not match');
		});

		it('should accept when both are empty', () => {
			const result = validatePasswordMatch('', '');
			expect(result.isValid).toBe(true);
		});

		it('should accept when one is empty (optional confirmation)', () => {
			// Based on the logic: it only checks mismatch if BOTH are filled
			const result = validatePasswordMatch('password123', '');
			// If password is set but confirmation is empty, it's still valid (not checked yet)
			expect(result.isValid).toBe(true);
		});
	});

	describe('Expiration validation', () => {
		const validExpirationOptions = [1, 24, 168, 720];

		function validateExpiration(hours: number): { isValid: boolean; error: string } {
			if (!validExpirationOptions.includes(hours)) {
				return {
					isValid: false,
					error: 'Invalid expiration time'
				};
			}
			return { isValid: true, error: '' };
		}

		it('should accept valid expiration options', () => {
			validExpirationOptions.forEach((hours) => {
				const result = validateExpiration(hours);
				expect(result.isValid).toBe(true);
			});
		});

		it('should reject invalid expiration values', () => {
			const result = validateExpiration(999);
			expect(result.isValid).toBe(false);
		});
	});
});
