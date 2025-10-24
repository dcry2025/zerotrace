<script lang="ts">
  import { onMount } from 'svelte';

  // Transition
  import { fade } from 'svelte/transition';

  let fadeIn = $state(false);
  const BASE_URL = import.meta.env.VITE_DOMAIN;

  import { t, loadTranslations, getInitialLocale } from '$lib/i18n/i18n';
  let ERROR_TEXT = '';

  let displayedChars = $state<string[]>([]);



  onMount(async () => {
    await loadTranslations(getInitialLocale(), '/');
    ERROR_TEXT = $t('error.title');
    fadeIn = true;
    for (const char of ERROR_TEXT) {
      displayedChars.push(char);
      displayedChars = [...displayedChars];
      await new Promise(r => setTimeout(r, 100));
    }

  });
</script>

<svelte:head>
  <title>{$t('error.title')} - zerotrace</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center text-center px-4">
  
  <!-- Brand Section -->
  <div class="mb-2">
    <div class="flex items-center justify-center space-x-1 mb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">zer🔒trace</h1>
        <p class="text-sm text-gray-500">{$t('common.footer.brandTag')}</p>
      </div>
    </div>
  </div>

  <!-- Error Content -->
  <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-gray-200">
    <div class="text-6xl mb-4">🚫</div>
    
    <div class="text-lg font-semibold text-gray-900 mb-2">
      {#each displayedChars as char}
        {char}
      {/each}
    </div>
    
    <p class="text-gray-600 mb-6">{$t('error.description')}</p>

    {#if fadeIn}
      <a
        href="/" 
        class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
        in:fade={fadeIn ? { duration: 1000 } : {duration:  0}}
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
        {$t('error.back')}
      </a>
    {/if}
  </div>

  <!-- Footer -->
  <div class="mt-8 text-center">
    <p class="text-sm text-gray-500">© 2025 zerotrace. All rights reserved.</p>
  </div>

</div>


