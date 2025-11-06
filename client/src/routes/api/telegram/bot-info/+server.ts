// Server-side API endpoint for getting Telegram bot info
import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Use environment variable or default to localhost
const API_BASE_URL = env.API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:7000';
const API_PREFIX = '/api/v11337';

export const GET: RequestHandler = async ({ url, fetch }) => {
	try {
		const username = url.searchParams.get('username');
		const queryString = username ? `?username=${encodeURIComponent(username)}` : '';

		const response = await fetch(`${API_BASE_URL}${API_PREFIX}/telegram/bot-info${queryString}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const data = await response.json();

		return json(data, { status: response.status });
	} catch (error) {
		console.error('Error getting bot info:', error);
		return json({ message: 'Failed to get bot info' }, { status: 500 });
	}
};
