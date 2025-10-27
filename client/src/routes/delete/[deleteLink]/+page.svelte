<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  
  // Components
  import { Footer, Header } from '$lib/components';
  import { t } from '$lib/i18n/i18n';
  
  // Get data from load function
  let { data }: { data: PageData } = $props();
  
  // Reactive state
  let deleting = $state(false);
  let success = $state(data.success);
  let error = $state(data.error);
  let errorMessage = $state(data.errorMessage);
  let confirming = $state(!data.success && !data.error); // Show confirmation if no success/error
  
  async function handleDelete() {
    if (!confirm($t('delete.confirm.subtitle'))) {
      return;
    }
    
    deleting = true;
    try {
      const response = await fetch(`/api/notes/delete/${data.deleteLink}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        success = true;
        confirming = false;
        // Redirect to home after 3 seconds
        setTimeout(() => {
          goto('/');
        }, 3000);
      } else {
        error = true;
        errorMessage = result.message || 'Unknown error';
        confirming = false;
      }
    } catch (err) {
      error = true;
      errorMessage = 'Network error occurred';
      confirming = false;
    } finally {
      deleting = false;
    }
  }
  
  onMount(() => {
    // If we already have success or error from URL params, show that state
    if (data.success) {
      confirming = false;
      success = true;
      // Redirect to home after 3 seconds
      setTimeout(() => {
        goto('/');
      }, 3000);
    } else if (data.error) {
      confirming = false;
      error = true;
    }
  });
</script>

<svelte:head>
  <title>{$t('delete.success.title')} - zerotrace</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-blue-900 flex flex-col">
  <!-- Header -->
  <Header subtitle={$t('delete.title')}/>

  <!-- Main Content -->
  <main class="flex-1 max-w-4xl mx-auto px-4 lg:px-8 pt-6 lg:pt-8 flex items-center justify-center">
    <div class="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden p-8 text-center max-w-md w-full">
      
      {#if confirming}
        <!-- Confirmation State -->
        <div class="animate-fade-in-up">
          <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white mb-4">{$t('delete.confirm.title')}</h1>
          <p class="text-slate-300 mb-6">{$t('delete.confirm.subtitle')}</p>
          <div class="flex gap-4 justify-center">
            <button 
              onclick={() => goto('/')}
              class="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {$t('delete.confirm.cancel')}
            </button>
            <button 
              onclick={handleDelete}
              class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {$t('delete.confirm.delete')}
            </button>
          </div>
        </div>
        
      {:else if deleting}
        <!-- Deleting State -->
        <div class="animate-fade-in-up">
          <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white mb-4">{$t('delete.deleting.title')}</h1>
          <p class="text-slate-300 mb-6">{$t('delete.deleting.subtitle')}</p>
          <div class="flex justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        </div>
        
      {:else if success}
        <!-- Success State -->
        <div class="animate-fade-in-up">
          <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce-in">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white mb-4">{$t('delete.success.title')}</h1>
          <p class="text-slate-300 mb-6">{$t('delete.success.subtitle')}</p>
          <div class="text-sm text-slate-400 mb-6">
            {$t('delete.success.redirect')}
          </div>
          <button 
            onclick={() => goto('/')}
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {$t('delete.success.button')}
          </button>
        </div>
        
      {:else if error}
        <!-- Error State -->
        <div class="animate-fade-in-up">
          <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white mb-4">{$t('delete.error.title')}</h1>
          <p class="text-slate-300 mb-6">{$t('delete.error.subtitle')}</p>
          {#if errorMessage}
            <div class="text-sm text-red-400 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {errorMessage}
            </div>
          {/if}
          <button 
            onclick={() => goto('/')}
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {$t('delete.error.button')}
          </button>
        </div>
      {/if}
      
    </div>
  </main>

  <Footer />
</div>
