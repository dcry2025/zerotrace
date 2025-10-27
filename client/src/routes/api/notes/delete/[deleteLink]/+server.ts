// Server-side API endpoint for deleting notes by delete link
import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Use environment variable or default to localhost
const API_BASE_URL = env.API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:7000';
const API_PREFIX = '/api/v11337';

export const DELETE: RequestHandler = async ({ params, fetch }) => {
  try {
    const { deleteLink } = params;
    
    const response = await fetch(
      `${API_BASE_URL}${API_PREFIX}/notes/delete/${deleteLink}`,
      {
        method: 'DELETE',
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
    console.error('[DELETE] Error deleting note by delete link:', error);
    return json(
      { success: false, message: 'Failed to delete note: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
};

export const GET: RequestHandler = async ({ params, fetch }) => {
  try {
    const { deleteLink } = params;
    
    const response = await fetch(
      `${API_BASE_URL}${API_PREFIX}/notes/delete/${deleteLink}`,
      {
        method: 'DELETE',
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GET] Backend error: ${response.status} - ${errorText}`);
      // Redirect to delete page with error
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/delete/${deleteLink}?error=true&message=${encodeURIComponent(`Backend error: ${response.status}`)}`
        }
      });
    }
    
    const data = await response.json();
    
    // Redirect to delete page with success
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/delete/${deleteLink}?success=true`
      }
    });
  } catch (error) {
    console.error('[GET] Error deleting note by delete link:', error);
    // Redirect to delete page with error
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/delete/${params.deleteLink}?error=true&message=${encodeURIComponent('Network error occurred')}`
      }
    });
  }
};
