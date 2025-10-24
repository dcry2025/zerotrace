<script lang="ts">
  import { t } from '$lib/i18n/i18n';
  
  // Props
  let { link, onCopy, copied }: { 
    link: string; 
    onCopy: () => void; 
    copied: boolean; 
  } = $props();
</script>

<!-- Link Display Card -->
<div
  class="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden mb-12">
  <!-- Card Header -->
  <div
    class="bg-gradient-to-r from-green-500/20 to-cyan-500/20 backdrop-blur-sm px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-700/50">
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
        <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-white">{$t('created.link.title')}</h3>
    </div>
  </div>

  <!-- Link Content -->
  <div class="p-4 sm:p-8">
    <div class="space-y-4">
      <div>
        <label for="note-link" class="block text-sm font-semibold text-slate-300 mb-3">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
            <span>{$t('created.link.label')}</span>
          </div>
        </label>
        <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <input
            id="note-link"
            type="text"
            readonly
            value={link}
            class="flex-1 px-3 sm:px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 break-all"
            onclick={(e: MouseEvent) => (e.target as HTMLInputElement).select()}
          />
          <button
            onclick={onCopy}
            class="px-4 sm:px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            {#if copied}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{$t('created.link.copied')}</span>
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <span>{$t('created.link.copy')}</span>
            {/if}
          </button>
        </div>
      </div>

      <!-- Security Notice -->
      <div
        class="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-4 sm:p-6">
        <div class="flex items-start space-x-3">
          <div
            class="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div>
            <h4 class="text-base sm:text-lg font-semibold text-yellow-200 mb-2">{$t('created.security.title')}</h4>
            <ul class="text-yellow-100 space-y-1 text-xs sm:text-sm">
              <li>• {$t('created.security.warning1')}</li>
              <li>• {$t('created.security.warning2')}</li>
              <li>• {$t('created.security.warning3')}</li>
              <li>• {$t('created.security.warning4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
