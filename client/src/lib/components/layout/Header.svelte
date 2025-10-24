<script lang="ts">
  import { t } from '$lib/i18n/i18n';
  
  interface Props {
    subtitle?: string;
    showBackButton?: boolean;
  }

  let { subtitle = undefined, showBackButton = false }: Props = $props();
</script>

<header class="bg-white shadow-sm border-b border-gray-200">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between min-h-16 py-2">
      <a href="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900">zer🔐trace</h1>
          <p class="text-xs sm:text-sm text-gray-500">{subtitle ?? $t('common.app.tagline')}</p>
        </div>
      </a>
      
      {#if showBackButton}
        <a 
          href="/"
          class="group flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg transition-all duration-200 hover:shadow-sm"
        >
          <svg class="w-4 h-4 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span class="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors">
            {$t('common.nav.back')}
          </span>
        </a>
      {/if}
    </div>
  </div>
</header>

