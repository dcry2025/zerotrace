import i18n from 'sveltekit-i18n';
import type { Config } from 'sveltekit-i18n';
import { browser } from '$app/environment';

// Define supported locales
export const locales = ['en', 'ru', 'uk', 'es', 'zh', 'tr', 'it', 'fr', 'de'] as const;
export type Locale = (typeof locales)[number];

// Get initial locale from browser or default
export const getInitialLocale = (): Locale => {
	if (browser) {
		// Check localStorage first
		const stored = localStorage.getItem('locale');
		if (stored && locales.includes(stored as Locale)) {
			return stored as Locale;
		}

		// Check browser language
		const browserLang = navigator.language.split('-')[0];
		if (locales.includes(browserLang as Locale)) {
			return browserLang as Locale;
		}
	}

	// Default to English
	return 'en';
};

/** @type {import('sveltekit-i18n').Config} */
const config: Config = {
	initLocale: getInitialLocale(),
	fallbackLocale: 'en',
	loaders: [
		// Common translations (loaded for all routes)
		{
			locale: 'en',
			key: 'common',
			loader: async () => (await import('./en/common.json')).default
		},
		{
			locale: 'ru',
			key: 'common',
			loader: async () => (await import('./ru/common.json')).default
		},
		{
			locale: 'uk',
			key: 'common',
			loader: async () => (await import('./uk/common.json')).default
		},
		{
			locale: 'es',
			key: 'common',
			loader: async () => (await import('./es/common.json')).default
		},
		{
			locale: 'zh',
			key: 'common',
			loader: async () => (await import('./zh/common.json')).default
		},
		{
			locale: 'tr',
			key: 'common',
			loader: async () => (await import('./tr/common.json')).default
		},
		{
			locale: 'it',
			key: 'common',
			loader: async () => (await import('./it/common.json')).default
		},
		{
			locale: 'fr',
			key: 'common',
			loader: async () => (await import('./fr/common.json')).default
		},
		{
			locale: 'de',
			key: 'common',
			loader: async () => (await import('./de/common.json')).default
		},

		// Home page translations
		{
			locale: 'en',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./en/home.json')).default
		},
		{
			locale: 'ru',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./ru/home.json')).default
		},
		{
			locale: 'uk',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./uk/home.json')).default
		},
		{
			locale: 'es',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./es/home.json')).default
		},
		{
			locale: 'zh',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./zh/home.json')).default
		},
		{
			locale: 'tr',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./tr/home.json')).default
		},
		{
			locale: 'it',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./it/home.json')).default
		},
		{
			locale: 'fr',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./fr/home.json')).default
		},
		{
			locale: 'de',
			key: 'home',
			routes: ['/'],
			loader: async () => (await import('./de/home.json')).default
		},

		// Created page translations
		{
			locale: 'en',
			key: 'created',
			routes: ['/created'],
			loader: async () => (await import('./en/created.json')).default
		},
		{
			locale: 'ru',
			key: 'created',
			routes: ['/created'],
			loader: async () => (await import('./ru/created.json')).default
		},
		{
			locale: 'uk',
			key: 'created',
			routes: ['/created'],
			loader: async () => (await import('./uk/created.json')).default
		},
		{
			locale: 'es',
			key: 'created',
			routes: ['/created'],
			loader: async () => (await import('./es/created.json')).default
		},
		{
			locale: 'zh',
			key: 'created',
			routes: ['/created'],
			loader: async () => (await import('./zh/created.json')).default
		},
		{
			locale: 'tr',
			key: 'created',
			routes: ['/created'],
			loader: async () => (await import('./tr/created.json')).default
		},
		{
			locale: 'it',
			key: 'created',
			routes: ['/created'],
			loader: async () => (await import('./it/created.json')).default
		},
		{
			locale: 'fr',
			key: 'created',
			routes: ['/created'],
			loader: async () => (await import('./fr/created.json')).default
		},
		{
			locale: 'de',
			key: 'created',
			routes: ['/created'],
			loader: async () => (await import('./de/created.json')).default
		},

		// Note view page translations
		{
			locale: 'en',
			key: 'note',
			routes: [/^\/note\/.+/],
			loader: async () => (await import('./en/note.json')).default
		},
		{
			locale: 'ru',
			key: 'note',
			routes: [/^\/note\/.+/],
			loader: async () => (await import('./ru/note.json')).default
		},
		{
			locale: 'uk',
			key: 'note',
			routes: [/^\/note\/.+/],
			loader: async () => (await import('./uk/note.json')).default
		},
		{
			locale: 'es',
			key: 'note',
			routes: [/^\/note\/.+/],
			loader: async () => (await import('./es/note.json')).default
		},
		{
			locale: 'zh',
			key: 'note',
			routes: [/^\/note\/.+/],
			loader: async () => (await import('./zh/note.json')).default
		},
		{
			locale: 'tr',
			key: 'note',
			routes: [/^\/note\/.+/],
			loader: async () => (await import('./tr/note.json')).default
		},
		{
			locale: 'it',
			key: 'note',
			routes: [/^\/note\/.+/],
			loader: async () => (await import('./it/note.json')).default
		},
		{
			locale: 'fr',
			key: 'note',
			routes: [/^\/note\/.+/],
			loader: async () => (await import('./fr/note.json')).default
		},
		{
			locale: 'de',
			key: 'note',
			routes: [/^\/note\/.+/],
			loader: async () => (await import('./de/note.json')).default
		},

		// FAQ page translations
		{
			locale: 'en',
			key: 'faq',
			routes: ['/info/faq'],
			loader: async () => (await import('./en/faq.json')).default
		},
		{
			locale: 'ru',
			key: 'faq',
			routes: ['/info/faq'],
			loader: async () => (await import('./ru/faq.json')).default
		},
		{
			locale: 'uk',
			key: 'faq',
			routes: ['/info/faq'],
			loader: async () => (await import('./uk/faq.json')).default
		},
		{
			locale: 'es',
			key: 'faq',
			routes: ['/info/faq'],
			loader: async () => (await import('./es/faq.json')).default
		},
		{
			locale: 'zh',
			key: 'faq',
			routes: ['/info/faq'],
			loader: async () => (await import('./zh/faq.json')).default
		},
		{
			locale: 'tr',
			key: 'faq',
			routes: ['/info/faq'],
			loader: async () => (await import('./tr/faq.json')).default
		},
		{
			locale: 'it',
			key: 'faq',
			routes: ['/info/faq'],
			loader: async () => (await import('./it/faq.json')).default
		},
		{
			locale: 'fr',
			key: 'faq',
			routes: ['/info/faq'],
			loader: async () => (await import('./fr/faq.json')).default
		},
		{
			locale: 'de',
			key: 'faq',
			routes: ['/info/faq'],
			loader: async () => (await import('./de/faq.json')).default
		},

		// Privacy page translations (load globally to avoid route-match edge cases)
		{
			locale: 'en',
			key: 'privacy',
			loader: async () => (await import('./en/privacy.json')).default
		},
		{
			locale: 'ru',
			key: 'privacy',
			loader: async () => (await import('./ru/privacy.json')).default
		},
		{
			locale: 'uk',
			key: 'privacy',
			loader: async () => (await import('./uk/privacy.json')).default
		},
		{
			locale: 'es',
			key: 'privacy',
			loader: async () => (await import('./es/privacy.json')).default
		},
		{
			locale: 'zh',
			key: 'privacy',
			loader: async () => (await import('./zh/privacy.json')).default
		},
		{
			locale: 'tr',
			key: 'privacy',
			loader: async () => (await import('./tr/privacy.json')).default
		},
		{
			locale: 'it',
			key: 'privacy',
			loader: async () => (await import('./it/privacy.json')).default
		},
		{
			locale: 'fr',
			key: 'privacy',
			loader: async () => (await import('./fr/privacy.json')).default
		},
		{
			locale: 'de',
			key: 'privacy',
			loader: async () => (await import('./de/privacy.json')).default
		},

		// Delete page translations
		{
			locale: 'en',
			key: 'delete',
			routes: [/^\/delete\/.+/],
			loader: async () => (await import('./en/delete.json')).default
		},
		{
			locale: 'ru',
			key: 'delete',
			routes: [/^\/delete\/.+/],
			loader: async () => (await import('./ru/delete.json')).default
		},
		{
			locale: 'uk',
			key: 'delete',
			routes: [/^\/delete\/.+/],
			loader: async () => (await import('./uk/delete.json')).default
		},
		{
			locale: 'es',
			key: 'delete',
			routes: [/^\/delete\/.+/],
			loader: async () => (await import('./es/delete.json')).default
		},
		{
			locale: 'zh',
			key: 'delete',
			routes: [/^\/delete\/.+/],
			loader: async () => (await import('./zh/delete.json')).default
		},
		{
			locale: 'tr',
			key: 'delete',
			routes: [/^\/delete\/.+/],
			loader: async () => (await import('./tr/delete.json')).default
		},
		{
			locale: 'it',
			key: 'delete',
			routes: [/^\/delete\/.+/],
			loader: async () => (await import('./it/delete.json')).default
		},
		{
			locale: 'fr',
			key: 'delete',
			routes: [/^\/delete\/.+/],
			loader: async () => (await import('./fr/delete.json')).default
		},
		{
			locale: 'de',
			key: 'delete',
			routes: [/^\/delete\/.+/],
			loader: async () => (await import('./de/delete.json')).default
		},

		// Error page translations (load for all routes)
		{
			locale: 'en',
			key: 'error',
			loader: async () => (await import('./en/error.json')).default
		},
		{
			locale: 'ru',
			key: 'error',
			loader: async () => (await import('./ru/error.json')).default
		},
		{
			locale: 'uk',
			key: 'error',
			loader: async () => (await import('./uk/error.json')).default
		},
		{
			locale: 'es',
			key: 'error',
			loader: async () => (await import('./es/error.json')).default
		},
		{
			locale: 'zh',
			key: 'error',
			loader: async () => (await import('./zh/error.json')).default
		},
		{
			locale: 'tr',
			key: 'error',
			loader: async () => (await import('./tr/error.json')).default
		},
		{
			locale: 'it',
			key: 'error',
			loader: async () => (await import('./it/error.json')).default
		},
		{
			locale: 'fr',
			key: 'error',
			loader: async () => (await import('./fr/error.json')).default
		},
		{
			locale: 'de',
			key: 'error',
			loader: async () => (await import('./de/error.json')).default
		}
	]
};

export const {
	t,
	locale,
	locales: availableLocales,
	loading,
	loadTranslations,
	setLocale
} = new i18n(config);

// Save locale to localStorage when it changes
if (browser) {
	locale.subscribe((value) => {
		if (value) {
			localStorage.setItem('locale', value);
			// Also set HTML lang attribute
			document.documentElement.lang = value;
		}
	});
}
