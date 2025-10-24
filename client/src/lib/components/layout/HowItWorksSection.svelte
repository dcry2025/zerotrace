<script lang="ts">
  import { t } from '$lib/i18n/i18n';
</script>

<!-- Info Section -->
<div class="mt-8 md:mt-16 bg-blue-50 rounded-xl md:rounded-2xl px-4 py-3 md:px-8 md:py-6 border border-blue-200">
  <div class="text-center">
    <div class="text-3xl md:text-4xl mb-3 md:mb-4">ℹ️</div>
    <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 tracking-tight">{$t('home.howItWorks.title')}</h3>
    <div class="max-w-2xl mx-auto text-gray-700">
      <p class="mb-3 md:mb-4 text-base md:text-lg leading-relaxed font-medium">{$t('home.howItWorks.description')}</p>
      <ol class="list-decimal list-inside space-y-2 md:space-y-3 text-left mb-4 md:mb-5 font-medium leading-relaxed">
        <li class="text-sm md:text-base">{$t('home.howItWorks.steps.1')}</li>
        <li class="text-sm md:text-base">{$t('home.howItWorks.steps.2')}</li>
        <li class="text-sm md:text-base">{$t('home.howItWorks.steps.3')}</li>
        <li class="text-sm md:text-base">{$t('home.howItWorks.steps.4')}</li>
      </ol>
      <p class="text-xs md:text-sm font-medium text-gray-600">
        <a href="/info/faq" class="text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-1 py-0.5 rounded transition-colors duration-200 font-semibold">{$t('common.nav.faq')}</a> 
        {$t('home.howItWorks.links', {}).replace('{faq}', '').replace('{privacy}', '')}
        <a href="/info/privacy" class="text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-1 py-0.5 rounded transition-colors duration-200 font-semibold">{$t('common.nav.privacy')}</a>.
      </p>
    </div>
  </div>
</div>
