import type { PageServerLoad } from './$types.js';

// Just pass uniqueLink to client, let client fetch fresh status
export const load: PageServerLoad = async ({ params }) => {
	return {
		uniqueLink: params.uniqueLink
	};
};
