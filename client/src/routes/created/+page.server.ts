import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
  const link = url.searchParams.get('link');
  const shouldNotify = url.searchParams.get('notify') === 'true';

  // Redirect if no link parameter
  if (!link) {
    throw redirect(307, '/');
  }

  // The link parameter is URL-encoded, so we need to decode it first
  const decodedLink = decodeURIComponent(link);

  // Extract uniqueLink from the decoded URL
  // URL format: {VITE_PUBLIC_URL}/note/ce386#key (e.g., http://localhost:3000/note/ce386#key or https://yourdomain.com/note/ce386#key)
  // We need to extract just the uniqueLink part (ce386)
  const urlParts = decodedLink.split('/');
  const notePart = urlParts[urlParts.length - 1]; // This is "ce386#key"
  const uniqueLink = notePart.split('#')[0]; // Extract just "ce386"

  if (!uniqueLink) {
    throw redirect(307, '/');
  }

  // Verify the note exists by checking its status via server API
  try {
    // Server-side fetch to internal API route
    const response = await fetch(`/api/notes/${uniqueLink}/status`);
    
    if (!response.ok) {
      throw redirect(307, '/');
    }

    const status = await response.json();
    
    // If note doesn't exist, redirect to home
    if (!status.exists) {
      throw redirect(307, '/');
    }

    // Note exists, return data (will be available in component via data prop)
    return {
      link: decodedLink, // Use decoded link for display
      uniqueLink,
      shouldNotify,
    };
  } catch (err: any) {
    // If API call fails or note doesn't exist, redirect to home
    console.error('Failed to verify note:', err);
    throw redirect(307, '/');
  }
};

