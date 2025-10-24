<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { toast } from '@zerodevx/svelte-toast';
  import DOMPurify from 'dompurify';
  import { t, loadTranslations, getInitialLocale } from '$lib/i18n/i18n';

  // Services
  import { notesService } from '$lib/services';
  
  // Crypto
  import { extractKeyFromUrl, clearUrlFragment, isValidKey } from '$lib/crypto';

  // Components
  import { Header, Footer } from '$lib/components';

  let noteContent = $state('');
  let password = $state('');
  let loading = $state(true);
  let error = $state('');
  let requiresPassword = $state(false);
  let noteRead = $state(false);
  let uniqueLink = $state('');
  let noteKey = $state('');
  let passwordAttempted = $state(false);
  /**
   * Sanitize text content to prevent XSS
   * This is an extra layer of protection - the server already sanitizes
   */
  function sanitizeText(text: string): string {
    // Configure DOMPurify to strip all HTML tags
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
      KEEP_CONTENT: true, // Keep the text content
    });
  }

  /**
   * Sanitize error messages from server to prevent XSS
   * Extra security layer for error messages
   */
  function sanitizeErrorMessage(message: string): string {
    if (!message) return '';
    return DOMPurify.sanitize(message, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }

  onMount(async () => {
    // Load translations for this route
    await loadTranslations(getInitialLocale(), window.location.pathname);
    
    // Extract uniqueLink from pathname as primary method (more reliable)
    const pathParts = window.location.pathname.split('/');
    const pathUniqueLink = pathParts[pathParts.length - 1];
    
    // Fallback to SvelteKit params
    const paramUniqueLink = $page.params.uniqueLink;
    
    // Use the one that looks like a valid note ID (not a full URL)
    if (pathUniqueLink && !pathUniqueLink.includes('http') && !pathUniqueLink.includes('localhost')) {
      uniqueLink = pathUniqueLink;
    } else if (paramUniqueLink && !paramUniqueLink.includes('http') && !paramUniqueLink.includes('localhost')) {
      uniqueLink = paramUniqueLink;
    } else {
      // Both contain full URLs, extract note ID from pathname
      uniqueLink = pathUniqueLink;
    }
    
    // 1. Extract noteKey from URL fragment (#key)
    noteKey = extractKeyFromUrl() || '';
    
    // 2. Immediately clear fragment from URL (security: don't leave key in browser history)
    clearUrlFragment();
    
    // 3. Validate noteKey
    if (!noteKey || !isValidKey(noteKey)) {
      error = sanitizeErrorMessage('Encryption key missing or invalid in URL. The link may be corrupted.');
      loading = false;
      return;
    }
    
    // 4. Check note status and load if available
    await checkNoteStatus();
  });

  async function checkNoteStatus() {
    try {
      loading = true;
      
      // Final safety check: ensure uniqueLink is just the note ID
      let finalUniqueLink = uniqueLink;
      if (finalUniqueLink && (finalUniqueLink.includes('http') || finalUniqueLink.includes('localhost'))) {
        console.error('uniqueLink still contains full URL in checkNoteStatus!');
        // Extract from current pathname as last resort
        const pathParts = window.location.pathname.split('/');
        finalUniqueLink = pathParts[pathParts.length - 1];
      }
      
      const status = await notesService.checkNoteStatus(finalUniqueLink);
      
      if (!status.exists) {
        error = sanitizeErrorMessage('Note not found or expired');
        return;
      }
      
      if (status.isRead) {
        error = sanitizeErrorMessage('This note has already been read and is no longer available');
        return;
      }
      
      
      if (status.hasPassword) {
        // Note requires password - show password form
        requiresPassword = true;
        error = '';
      } else {
        // Note doesn't require password - try to read it directly
        await loadNote();
      }
    } catch (err: any) {
      console.error('Error checking note status:', err);
      error = sanitizeErrorMessage('Failed to load note. Please try again.');
    } finally {
      loading = false;
    }
  }

  async function loadNote() {
    try {
      loading = true;
      
      // Pass noteKey for decryption
      const response = await notesService.readNote(uniqueLink, noteKey, password || undefined);
      
      // Service returns: { content } - content is already decrypted
      // Sanitize content for extra security (defense in depth)
      const rawContent = response.content || '';
      noteContent = sanitizeText(rawContent);
      noteRead = true;
      requiresPassword = false;
      error = '';
    } catch (err: any) {
      console.error('Error loading note:', err);
      
      // Extract error message from ky error
      if (err?.response) {
        try {
          const errorData = await err.response.json();
          const errorMessage = errorData.message || '';
          
          // Check for incorrect password FIRST (before generic 401 check)
          // Only show toast if user actually attempted to enter a password
          if (errorMessage.includes('Incorrect password') && passwordAttempted) {
            requiresPassword = true;
            error = ''; // Don't set error to keep password form visible
            toast.push('Incorrect password', {
              theme: {
                '--toastBackground': '#EF4444',
                '--toastColor': '#FFFFFF',
                '--toastBarBackground': '#DC2626'
              }
            });
          } else if (err.response.status === 401 || errorMessage.includes('Password required')) {
            // Password is required but not provided yet
            requiresPassword = true;
            error = '';
          } else {
            error = sanitizeErrorMessage(errorMessage || 'Note not found or expired');
          }
        } catch {
          error = sanitizeErrorMessage('Failed to load note. Please try again.');
        }
      } else {
        error = sanitizeErrorMessage('Failed to load note. Please check your connection.');
      }
    } finally {
      loading = false;
    }
  }

  async function handlePasswordSubmit() {
    passwordAttempted = true; // Mark that user has attempted password entry
    await loadNote();
  }
</script>

<svelte:head>
  <title>{$t('note.loading.title')} - zerotrace</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex flex-col">
  <!-- Header -->
  <Header subtitle={$t('note.loading.title')}/>

  <!-- Main Content -->
  <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    {#if loading}
      <!-- Loading State -->
      <div class="text-center">
        <div class="w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
          <svg class="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-4">{$t('note.loading.title')}</h2>
        <p class="text-lg text-gray-600">{$t('note.loading.subtitle')}</p>
      </div>

    {:else if error}
      <!-- Error State -->
      <div class="text-center">
        <div class="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-4">{$t('note.error.title')}</h2>
        <p class="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          {error}. {$t('note.error.subtitle')}
        </p>
        
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md mx-auto">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{$t('note.error.whatHappened')}</h3>
          <div class="space-y-3 text-sm text-gray-600 text-left">
            <div class="flex items-start space-x-2">
              <div class="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>{$t('note.error.reason1')}</span>
            </div>
            <div class="flex items-start space-x-2">
              <div class="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>{$t('note.error.reason2')}</span>
            </div>
            <div class="flex items-start space-x-2">
              <div class="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>{$t('note.error.reason3')}</span>
            </div>
          </div>
        </div>

        <div class="mt-8">
          <a 
            href="/"
            class="inline-block bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {$t('note.error.createNew')}
          </a>
        </div>
      </div>

    {:else if requiresPassword}
      <!-- Password Required State -->
      <div class="max-w-md mx-auto">
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">{$t('note.password.title')}</h2>
          <p class="text-lg text-gray-600">{$t('note.password.subtitle')}</p>
        </div>

        <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div class="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-6">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white">{$t('note.password.label')}</h3>
            </div>
          </div>

          <div class="p-8">
            <form onsubmit={(e) => { e.preventDefault(); handlePasswordSubmit(); }} class="space-y-6">
              <div>
                <label for="password" class="block text-sm font-semibold text-gray-700 mb-3">
                  <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <span>{$t('note.password.label')}</span>
                  </div>
                </label>
                <input
                  id="password"
                  type="password"
                  bind:value={password}
                  placeholder={$t('note.password.placeholder')}
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{$t('note.password.unlock')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

    {:else if noteRead}
      <!-- Note Content State -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-4">{$t('note.success.title')}</h2>
        <p class="text-lg text-gray-600">{$t('note.success.subtitle')}</p>
      </div>

      <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-12">
        <div class="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-6">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white">{$t('note.success.messageTitle')}</h3>
          </div>
        </div>

        <div class="p-8">
          <div class="note-container bg-gray-50 rounded-2xl p-6 border border-gray-200 overflow-hidden">
            <pre class="note-content whitespace-pre-wrap text-gray-900 font-medium leading-relaxed break-all overflow-wrap-anywhere max-w-full word-break-break-all hyphens-auto">{noteContent}</pre>
          </div>

          <!-- Security Notice -->
          <div class="mt-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-red-800 mb-2">{$t('note.success.deleted')}</h4>
                <p class="text-red-700 text-sm">
                  {$t('note.success.deletedText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="text-center">
        <a 
          href="/"
          class="inline-block bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {$t('note.success.createNew')}
        </a>
      </div>
    {/if}
  </main>

  <!-- Footer -->
  <Footer/>
  </div>

<style>
  /* Mobile-specific text wrapping for note content */
  @media (max-width: 768px) {
    .note-content {
      word-break: break-all !important;
      overflow-wrap: anywhere !important;
      hyphens: auto !important;
      white-space: pre-wrap !important;
      max-width: 100% !important;
      overflow: hidden !important;
    }
    
    .note-container {
      overflow-x: hidden !important;
      max-width: 100% !important;
    }
  }
</style>