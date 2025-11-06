import { loadTranslations, getInitialLocale } from '$lib/i18n/i18n';
import type { LayoutLoad } from './$types';

// ✅ Enable SSR for better performance and SEO
export const ssr = true;
export const prerender = false;
export const csr = true;

export const load: LayoutLoad = async ({ url }) => {
	const { pathname } = url;

	// Load translations for the current route
	await loadTranslations(getInitialLocale(), pathname);

	return {};
};
