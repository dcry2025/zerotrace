<script lang="ts">
  import { locale, setLocale, t } from '$lib/i18n/i18n';
  import { slide } from 'svelte/transition';
  
  let isOpen = $state(false);
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];
  
  function handleLanguageChange(code: string) {
    setLocale(code);
    isOpen = false;
  }
  
  const currentLanguage = $derived(
    languages.find(lang => lang.code === $locale) || languages[0]
  );
  
  $effect(() => {
    // Close dropdown when clicking outside
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.language-switcher')) {
        isOpen = false;
      }
    };
    
    if (isOpen) {
      document.addEventListener('click', handleClick);
    }
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  });
</script>

<div class="language-switcher relative">
  <button
    onclick={() => isOpen = !isOpen}
    class="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 border border-gray-300"
    aria-label={$t('common.language.select')}
  >
    <span class="text-xl">{currentLanguage.flag}</span>
    <span class="hidden sm:inline text-sm font-medium text-gray-700">{currentLanguage.name}</span>
    <svg 
      class="w-4 h-4 text-gray-600 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
    </svg>
  </button>
  
  {#if isOpen}
    <div 
      class="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-64 overflow-y-auto sm:bottom-full sm:mb-2 md:bottom-full md:mb-2"
      transition:slide={{ duration: 200, axis: 'y' }}
    >
      {#each languages as language}
        <button
          onclick={() => handleLanguageChange(language.code)}
          class="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 transition-colors duration-150 {$locale === language.code ? 'bg-blue-50' : ''}"
        >
          <span class="text-lg">{language.flag}</span>
          <div class="flex-1 text-left">
            <div class="font-medium text-gray-900 text-sm">{language.name}</div>
            <div class="text-xs text-gray-500">{language.code.toUpperCase()}</div>
          </div>
          {#if $locale === language.code}
            <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .language-switcher {
    user-select: none;
  }
</style>

