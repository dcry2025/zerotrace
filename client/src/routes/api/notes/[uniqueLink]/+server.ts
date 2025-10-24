// Server-side API endpoint for deleting notes
import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Use environment variable or default to localhost
const API_BASE_URL = env.API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:7000';
const API_PREFIX = '/api/v11337';

export const DELETE: RequestHandler = async ({ params, fetch }) => {
  try {
    const { uniqueLink } = params;
    
    const response = await fetch(
      `${API_BASE_URL}${API_PREFIX}/notes/${uniqueLink}`,
      {
        method: 'DELETE',
        // Убираем Content-Type для DELETE запроса без тела
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DELETE] Backend error: ${response.status} - ${errorText}`);
      return json(
        { success: false, message: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return json(data, { status: response.status });
  } catch (error) {
    console.error('[DELETE] Error deleting note:', error);
    return json(
      { success: false, message: 'Failed to delete note: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
};

