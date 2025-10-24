// Server-side API endpoint for reading notes
import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Use environment variable or default to localhost
const API_BASE_URL = env.API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:7000';
const API_PREFIX = '/api/v11337';

export const POST: RequestHandler = async ({ params, request, fetch }) => {
  try {
    const { uniqueLink } = params;
    const body = await request.json();
    
    const response = await fetch(
      `${API_BASE_URL}${API_PREFIX}/notes/${uniqueLink}/read`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    
    const data = await response.json();
    
    return json(data, { status: response.status });
  } catch (error) {
    console.error('Error reading note:', error);
    return json(
      { message: 'Failed to read note' },
      { status: 500 }
    );
  }
};

