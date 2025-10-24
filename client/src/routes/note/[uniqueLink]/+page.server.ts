import { error, type RequestHandler } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { uniqueLink } = params;

  try {
    // Server-side fetch to check note status
    const response = await fetch(`/api/notes/${uniqueLink}/status`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw error(404, 'Note not found');
      }
      throw error(response.status, 'Failed to load note');
    }

    const status = await response.json();
    
    // Check if note exists
    if (!status.exists) {
      throw error(404, 'Note not found');
    }

    // Check if already read
    if (status.isRead) {
      throw error(410, 'This note has already been read and is no longer available');
    }

    // Return note status to the page component
    return {
      noteStatus: {
        exists: status.exists,
        hasPassword: status.hasPassword,
      },
      uniqueLink,
    };
  } catch (err: any) {
    // Re-throw SvelteKit errors
    if (err.status) {
      throw err;
    }
    
    console.error('Error loading note:', err);
    throw error(500, 'Failed to load note');
  }
};
