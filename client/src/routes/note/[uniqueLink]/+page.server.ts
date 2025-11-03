import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { uniqueLink } = params;

  try {
    // Server-side fetch to check note status
    const response = await fetch(`/api/notes/${uniqueLink}/status`);
    
    if (!response.ok) {
      // Don't throw error - return status for client-side handling
      return {
        noteStatus: {
          exists: false,
          hasPassword: false,
          error: response.status === 404 ? 'not_found' : 'failed_to_load',
        },
        uniqueLink,
      };
    }

    const status = await response.json();
    
    // Return note status to the page component (including error states)
    return {
      noteStatus: {
        exists: status.exists,
        hasPassword: status.hasPassword,
        isRead: status.isRead,
      },
      uniqueLink,
    };
  } catch (err: any) {
    console.error('Error loading note:', err);
    // Return error status instead of throwing
    return {
      noteStatus: {
        exists: false,
        hasPassword: false,
        error: 'failed_to_load',
      },
      uniqueLink,
    };
  }
};
