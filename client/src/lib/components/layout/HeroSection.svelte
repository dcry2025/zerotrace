<script lang="ts">
  import { t } from '$lib/i18n/i18n';
</script>

<!-- Hero Section -->
<div class="text-center mb-8 md:mb-12">
  <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
    {@html $t('home.hero.title')}
  </h2>
  <p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
    {$t('home.hero.subtitle')}
  </p>
</div>
