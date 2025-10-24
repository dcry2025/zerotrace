<script lang="ts">
  import { t } from '$lib/i18n/i18n';
</script>

<!-- Features Section -->
<div class="mt-8 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
  <div class="card text-center">
    <div class="text-4xl mb-4">🔐</div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">{$t('home.features.encryption.title')}</h3>
    <p class="text-gray-600 text-sm">{$t('home.features.encryption.description')}</p>
  </div>

  <div class="card text-center">
    <div class="text-4xl mb-4">💥</div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">{$t('home.features.destruct.title')}</h3>
    <p class="text-gray-600 text-sm">{$t('home.features.destruct.description')}</p>
  </div>

  <div class="card text-center">
    <div class="text-4xl mb-4">📱</div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">{$t('home.features.notifications.title')}</h3>
    <p class="text-gray-600 text-sm">{$t('home.features.notifications.description')}</p>
  </div>
</div>
