// Server-side API endpoint for checking note status
import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Use environment variable or default to localhost
const API_BASE_URL = env.API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:7000';
const API_PREFIX = '/api/v11337';

export const GET: RequestHandler = async ({ params, fetch }) => {
  try {
    const { uniqueLink } = params;
    
    const response = await fetch(
      `${API_BASE_URL}${API_PREFIX}/notes/${uniqueLink}/status`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    return json(data, { status: response.status });
  } catch (error) {
    console.error('Error checking note status:', error);
    return json(
      { message: 'Failed to check note status' },
      { status: 500 }
    );
  }
};

