<script lang="ts">
  import { slide } from 'svelte/transition';
  import { t } from '$lib/i18n/i18n';
  import DOMPurify from 'dompurify';

  // Props
  let { 
    botInfo, 
    uniqueLink, 
    loadingBotInfo, 
    onOpenBot 
  }: { 
    botInfo: { username: string | null; link: string | null; ready: boolean } | null; 
    uniqueLink: string; 
    loadingBotInfo: boolean; 
    onOpenBot: () => void; 
  } = $props();

  // Reactive
  const showCard = $derived(botInfo !== null);
  const botUsername = $derived(botInfo?.username || null);
  const botLink = $derived(botInfo?.link || null);
  const isBotReady = $derived(botInfo?.ready || false);

  /**
   * Sanitize text to prevent XSS attacks
   */
  function sanitizeText(text: string | null | undefined): string {
    if (!text) return '';
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }
</script>

<!-- Telegram Bot Integration -->
{#if showCard}
  <div
    class="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-500/30 overflow-hidden mb-12"
    transition:slide={{ duration: 400 }}
  >
    <!-- Card Header -->
    <div
      class="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm px-4 sm:px-8 py-4 sm:py-6 border-b border-blue-500/30">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.566-4.458c.538-.196 1.006.128.832.941z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-lg sm:text-xl font-bold text-white">{$t('created.telegram.title')}</h3>
            <p class="text-xs sm:text-sm text-blue-100">{$t('created.telegram.subtitle')}</p>
          </div>
        </div>
        <div
          class="bg-green-500/20 text-green-300 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">
          {$t('created.telegram.status')}
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="p-3 sm:p-8">
      <div class="space-y-4 sm:space-y-6">
        <!-- Status Info -->
        <div class="flex flex-col space-y-4">
          <div class="flex items-start space-x-3">
            <div class="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 sm:w-6 sm:h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm sm:text-lg font-semibold text-white mb-2">{$t('created.telegram.activate')}</h4>
              <p class="text-blue-100 text-xs sm:text-sm leading-relaxed mb-4">
                {$t('created.telegram.description')}
              </p>
            </div>
          </div>
          
          <!-- Bot and Note ID Info -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
            <div class="space-y-3">
              <div class="flex items-center space-x-2">
                <span class="text-blue-300 text-base sm:text-lg">🤖</span>
                <span class="text-xs sm:text-sm font-medium text-white">{$t('created.telegram.bot')}</span>
                {#if botUsername}
                  <code class="text-xs sm:text-sm text-cyan-300 font-mono bg-cyan-500/20 px-2 py-1 rounded break-all">@{sanitizeText(botUsername)}</code>
                {:else}
                  <span class="text-xs sm:text-sm text-slate-400">Loading...</span>
                {/if}
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-blue-300 text-base sm:text-lg mt-0.5">🔗</span>
                <div class="flex-1 min-w-0">
                  <span class="text-xs sm:text-sm font-medium text-white block mb-1">{$t('created.telegram.noteId')}</span>
                  <code class="text-xs sm:text-sm text-cyan-300 font-mono bg-cyan-500/20 px-2 py-1 rounded break-all block w-full">{sanitizeText(uniqueLink)}</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Steps to Activate -->
        <div
          class="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-slate-600/50">
          <h4 class="text-sm sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center space-x-2">
            <span class="text-lg sm:text-2xl">📋</span>
            <span>{$t('created.telegram.setup')}</span>
          </h4>
          <ol class="space-y-2 sm:space-y-3 text-white">
            <li class="flex items-start space-x-2 sm:space-x-3">
              <span
                class="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">1</span>
              <span class="flex-1 text-xs sm:text-sm leading-relaxed">{$t('created.telegram.step1')}</span>
            </li>
            <li class="flex items-start space-x-2 sm:space-x-3">
              <span
                class="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">2</span>
              <span class="flex-1 text-xs sm:text-sm leading-relaxed">{$t('created.telegram.step2').split('Press ')[0]}Press <code
                class="bg-slate-600 px-1 sm:px-2 py-0.5 rounded text-cyan-300 text-xs">START</code> or send <code
                class="bg-slate-600 px-1 sm:px-2 py-0.5 rounded text-cyan-300 text-xs">/start</code></span>
            </li>
            <li class="flex items-start space-x-2 sm:space-x-3">
              <span
                class="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">✓</span>
              <span class="flex-1 text-xs sm:text-sm leading-relaxed">{$t('created.telegram.step3')}</span>
            </li>
          </ol>
        </div>

        <!-- Action Button -->
        <div class="px-0 sm:px-2">
          <button
            onclick={onOpenBot}
            disabled={!botLink}
            class="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none flex items-center justify-center space-x-2 sm:space-x-3 text-sm sm:text-lg"
          >
            <svg class="w-4 h-4 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.566-4.458c.538-.196 1.006.128.832.941z" />
            </svg>
            <span class="hidden sm:inline">{$t('created.telegram.openBot')}</span>
            <span class="sm:hidden">{$t('created.telegram.openBot')}</span>
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </button>
        </div>

        <!-- Additional Info -->
        <div class="space-y-2 sm:space-y-3">
          <div class="flex items-start space-x-2 text-xs sm:text-sm text-blue-200">
            <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <span class="leading-relaxed">{$t('created.telegram.privacy')}</span>
          </div>
          <div class="flex items-start space-x-2 text-xs sm:text-sm text-blue-200">
            <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1-1.964-1-2.732 0L3.34 16c-.768 1.333.192 3 1.732 3z"></path>
            </svg>
            <span class="leading-relaxed">{$t('created.telegram.emergency')}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
