<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  // Api
  import { telegramApi, notesApi } from '$lib/api';

  // Components
  import { 
    Footer, 
    Header, 
    SuccessMessage, 
    LinkDisplayCard, 
    TelegramBotCard,
    DestroyNoteButton
  } from '$lib/components';
  import { t } from '$lib/i18n/i18n';

  // Get data from load function (verified server-side) using Svelte 5
  let { data }: { data: PageData } = $props();

  // Reactive
  let link = $state(data.link);
  let deleteLink = $state(data.deleteLink);
  let uniqueLink = $state(data.uniqueLink);
  let shouldNotify = $state(data.shouldNotify);
  let copied = $state(false);
  let deleteCopied = $state(false);
  let botInfo = $state<{ username: string | null; link: string | null; ready: boolean } | null>(null);
  let loadingBotInfo = $state(false);
  let destroying = $state(false);
  let destroyed = $state(false);

  // Derived values
  const showTelegramCard = $derived(shouldNotify && botInfo);
  const isDestroying = $derived(destroying);
  const isDestroyed = $derived(destroyed);

  // Event handlers
  function handleCopyToClipboard() {
    navigator.clipboard.writeText(link).then(() => {
      copied = true;
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setTimeout(() => {
        copied = false;
      }, 2000);
    }).catch((error) => {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        copied = true;
        setTimeout(() => {
          copied = false;
        }, 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    });
  }

  function handleCopyDeleteLinkToClipboard() {
    if (deleteLink) {
      navigator.clipboard.writeText(deleteLink).then(() => {
        deleteCopied = true;
        // Add haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        setTimeout(() => {
          deleteCopied = false;
        }, 2000);
      }).catch((error) => {
        console.error('Failed to copy delete link to clipboard:', error);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = deleteLink;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          deleteCopied = true;
          setTimeout(() => {
            deleteCopied = false;
          }, 2000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
      });
    }
  }

  function handleOpenTelegramBot() {
    if (botInfo?.link) {
      window.open(botInfo.link, '_blank');
    }
  }

  onMount(async () => {
    // Load bot info if notification was requested
    if (shouldNotify && uniqueLink) {
      loadingBotInfo = true;
      try {
        // Pass uniqueLink as start parameter for bot deep linking
        botInfo = await telegramApi.getBotInfo(uniqueLink);
      } catch (error) {
        console.error('Failed to load bot info:', error);
      } finally {
        loadingBotInfo = false;
      }
    }
  });

  async function handleDestroyNote() {
    if (!confirm($t('created.destroy.confirm'))) {
      return;
    }

    destroying = true;
    try {
      const result = await notesApi.destroyNote(uniqueLink);
      
      if (result && result.success) {
        destroyed = true;
      } else {
        const errorMsg = result?.message || 'Unknown error';
        console.error('[destroyNote] Failed:', errorMsg);
        alert($t('created.destroy.failed') || ('Failed to destroy note: ' + errorMsg));
      }
    } catch (error: any) {
      console.error('[destroyNote] Exception:', error);
      
      // Более детальная обработка ошибок
      let errorMessage = 'Failed to destroy note. Please try again.';
      if (error?.response) {
        try {
          const errorData = await error.response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      destroying = false;
    }
  }

  async function destroyNote() {
    if (!confirm($t('created.destroy.confirm'))) {
      return;
    }

    destroying = true;
    try {
      const result = await notesApi.destroyNote(uniqueLink);
      
      if (result && result.success) {
        destroyed = true;
        setTimeout(() => {
          goto('/');
        }, 2000);
      } else {
        const errorMsg = result?.message || 'Unknown error';
        console.error('[destroyNote] Failed:', errorMsg);
        alert($t('created.destroy.failed') || ('Failed to destroy note: ' + errorMsg));
      }
    } catch (error: any) {
      console.error('[destroyNote] Exception:', error);
      
      // Более детальная обработка ошибок
      let errorMessage = 'Failed to destroy note. Please try again.';
      if (error?.response) {
        try {
          const errorData = await error.response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      destroying = false;
    }
  }
</script>

<svelte:head>
  <title>{$t('created.success.title')} - zerotrace</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-blue-900 flex flex-col">
  <!-- Header -->
  <Header subtitle={$t('created.success.subtitle')}/>

  <!-- Main Content -->
  <main class="flex-1 max-w-4xl mx-auto px-4  lg:px-8 pt-6 lg:pt-8">
    <!-- Success Message Component -->
    <SuccessMessage 
      title={$t('created.success.title')} 
      subtitle={$t('created.success.subtitle')} 
    />

    <!-- Link Display Card Component -->
    <LinkDisplayCard 
      {link} 
      {deleteLink}
      onCopy={handleCopyToClipboard} 
      onCopyDelete={handleCopyDeleteLinkToClipboard}
      {copied}
      {deleteCopied}
    />

    <!-- Destroy Note Button Component -->
    <DestroyNoteButton 
      {uniqueLink}
      onDestroy={handleDestroyNote}
      {destroying}
      {destroyed}
    />

    <!-- Telegram Bot Card Component -->
    {#if showTelegramCard}
      <TelegramBotCard 
        {botInfo}
        {uniqueLink}
        {loadingBotInfo}
        onOpenBot={handleOpenTelegramBot}
      />
    {/if}
    
  </main>

  <Footer />
</div>