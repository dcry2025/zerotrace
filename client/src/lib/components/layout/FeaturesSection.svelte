<script lang="ts">
	import { t } from '$lib/i18n/i18n';
</script>

<!-- Features Section -->
<div class="mt-8 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-3 md:gap-8">
	<div class="card text-center">
		<div class="mb-4 text-4xl">🔐</div>
		<h3 class="mb-2 text-lg font-semibold text-gray-900">{$t('home.features.encryption.title')}</h3>
		<p class="text-sm text-gray-600">{$t('home.features.encryption.description')}</p>
	</div>

	<div class="card text-center">
		<div class="mb-4 text-4xl">💥</div>
		<h3 class="mb-2 text-lg font-semibold text-gray-900">{$t('home.features.destruct.title')}</h3>
		<p class="text-sm text-gray-600">{$t('home.features.destruct.description')}</p>
	</div>

	<div class="card text-center">
		<div class="mb-4 text-4xl">📱</div>
		<h3 class="mb-2 text-lg font-semibold text-gray-900">
			{$t('home.features.notifications.title')}
		</h3>
		<p class="text-sm text-gray-600">{$t('home.features.notifications.description')}</p>
	</div>
</div>
