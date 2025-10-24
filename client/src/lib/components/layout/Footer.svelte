<script lang="ts">
  // Components
  import CryptoDonations from '../common/CryptoDonations.svelte';
  import LanguageSwitcher from '../common/LanguageSwitcher.svelte';
  import { t } from '$lib/i18n/i18n';
  import { CONTACTS } from '$lib';
  const year = new Date().getFullYear();
</script>

<footer class="mt-10 bg-white border-t border-gray-200 min-h-[400px]">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Mobile Layout (centered) -->
    <div class="md:hidden">
      <!-- Brand Section -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center space-x-3 mb-4">
          <div class="text-3xl">🔒</div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">zer🔐trace</h3>
            <p class="text-sm text-gray-500">{$t('common.footer.brandTag')}</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 max-w-sm mx-auto min-h-[3rem] flex items-center justify-center">
          {$t('common.footer.brandDesc')}
        </p>
      </div>

      <!-- Support Links -->
      <div class="text-center mb-6">
        <h4 class="text-sm font-semibold text-gray-900 mb-4">{$t('common.footer.support')}</h4>
        <div class="space-y-2">
          <a href="/info/privacy" class="block text-sm text-gray-600 hover:text-blue-600 transition-colors">{$t('common.nav.privacy')}</a>
          <a href="/info/faq" class="block text-sm text-gray-600 hover:text-blue-600 transition-colors">{$t('common.nav.faq')}</a>
        </div>
      </div>

      <!-- Social Links -->
      <div class="text-center mb-6">
        <h4 class="text-sm font-semibold text-gray-900 mb-4">{$t('common.footer.connect')}</h4>
        <div class="flex justify-center space-x-8">
          <a href={CONTACTS.TWITTER.url} target="_blank" rel="noopener noreferrer" class="group flex flex-col items-center">
            <svg class="w-8 h-8 fill-current text-gray-600 group-hover:text-[#1DA1F2] transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span class="block text-xs mt-2 text-gray-600 group-hover:text-[#1DA1F2] transition-colors">Twitter</span>
          </a>
          <a href={CONTACTS.TELEGRAM.url} target="_blank" rel="noopener noreferrer" class="group flex flex-col items-center">
            <svg class="w-8 h-8 fill-current text-gray-600 group-hover:text-[#0088cc] transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            <span class="block text-xs mt-2 text-gray-600 group-hover:text-[#0088cc] transition-colors">Telegram</span>
          </a>
        </div>
      </div>

      <!-- Language Selector -->
      <div class="flex justify-center mb-6">
        <LanguageSwitcher />
      </div>

      <!-- Donation Section (Mobile) -->
      <div class="text-center mb-6">
        <div class="flex items-center justify-center gap-2 mb-4">
          <h4 class="text-sm font-semibold text-gray-900">{$t('common.footer.donate')}</h4>
          <div class="relative group inline-block">
            <button
              class="inline-flex items-center justify-center w-5 h-5 text-xs text-blue-600 hover:text-blue-700 transition-colors cursor-help"
              aria-label="Donation information"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </button>
            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 text-center">
              <div class="relative">
                <p class="leading-relaxed">{$t('common.footer.donateInfo')}</p>
                <!-- Arrow -->
                <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                  <div class="w-2 h-2 bg-gray-900 transform rotate-45"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CryptoDonations isMobile={true} />
      </div>
    </div>

    <!-- Desktop Layout -->
    <div class="hidden md:grid grid-cols-4 gap-8">
      <!-- Brand Column -->
      <div class="col-span-1">
        <div class="flex items-center space-x-3 mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900">zer🔐trace</h3>
            <p class="text-xs text-gray-500">{$t('common.footer.brandTag')}</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-4 min-h-[3rem] flex items-center">
          {$t('common.footer.brandDesc')}
        </p>
      </div>

      <!-- Links Column -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-4">{$t('common.footer.support')}</h4>
        <div class="space-y-2">
          <a href="/info/privacy" class="block text-sm text-gray-600 hover:text-blue-600 transition-colors">{$t('common.nav.privacy')}</a>
          <a href="/info/faq" class="block text-sm text-gray-600 hover:text-blue-600 transition-colors">{$t('common.nav.faq')}</a>
        </div>
      </div>

      <!-- Social & Language Column -->
      <div>
        <h4 class="text-sm font-semibold text-gray-900 mb-4">{$t('common.footer.connect')}</h4>
        <div class="space-y-3 mb-4">
          <a href={CONTACTS.TWITTER.url} target="_blank" rel="noopener noreferrer" class="flex items-center space-x-2 text-sm text-gray-600 hover:text-[#1DA1F2] transition-colors group">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>Twitter</span>
          </a>
          <a href={CONTACTS.TELEGRAM.url} target="_blank" rel="noopener noreferrer" class="flex items-center space-x-2 text-sm text-gray-600 hover:text-[#0088cc] transition-colors group">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            <span>Telegram</span>
          </a>
        </div>
        
        <div class="mt-4">
          <LanguageSwitcher />
        </div>
      </div>

      <!-- Donation Column (Desktop) -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <h4 class="text-sm font-semibold text-gray-900">{$t('common.footer.donate')}</h4>
          <div class="relative group inline-block">
            <button
              class="inline-flex items-center justify-center w-5 h-5 text-xs text-blue-600 hover:text-blue-700 transition-colors cursor-help"
              aria-label="Donation information"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </button>
            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 text-center">
              <div class="relative">
                <p class="leading-relaxed">{$t('common.footer.donateInfo')}</p>
                <!-- Arrow -->
                <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                  <div class="w-2 h-2 bg-gray-900 transform rotate-45"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CryptoDonations isMobile={false} />
      </div>
    </div>

    <!-- Bottom Line -->
    <div class="mt-8 pt-6 border-t border-gray-200 text-center min-h-[2.5rem] flex items-center justify-center">
      <p class="text-sm text-gray-500">{$t('common.footer.copyright').replace('{year}', year.toString())}</p>
    </div>
  </div>
</footer>

