import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const { deleteLink } = params;
	const success = url.searchParams.get('success') === 'true';
	const error = url.searchParams.get('error') === 'true';
	const errorMessage = url.searchParams.get('message') || '';

	return {
		deleteLink,
		success,
		error,
		errorMessage
	};
};
