<script lang="ts">
	import { t } from '$lib/i18n/i18n';
</script>

<!-- Info Section -->
<div
	class="mt-8 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 md:mt-16 md:rounded-2xl md:px-8 md:py-6"
>
	<div class="text-center">
		<div class="mb-3 text-3xl md:mb-4 md:text-4xl">ℹ️</div>
		<h3 class="mb-3 text-xl font-bold tracking-tight text-gray-900 md:mb-4 md:text-2xl">
			{$t('home.howItWorks.title')}
		</h3>
		<div class="mx-auto max-w-2xl text-gray-700">
			<p class="mb-3 text-base font-medium leading-relaxed md:mb-4 md:text-lg">
				{$t('home.howItWorks.description')}
			</p>
			<ol
				class="mb-4 list-inside list-decimal space-y-2 text-left font-medium leading-relaxed md:mb-5 md:space-y-3"
			>
				<li class="text-sm md:text-base">{$t('home.howItWorks.steps.1')}</li>
				<li class="text-sm md:text-base">{$t('home.howItWorks.steps.2')}</li>
				<li class="text-sm md:text-base">{$t('home.howItWorks.steps.3')}</li>
				<li class="text-sm md:text-base">{$t('home.howItWorks.steps.4')}</li>
			</ol>
			<p class="text-xs font-medium text-gray-600 md:text-sm">
				<a
					href="/info/faq"
					class="rounded px-1 py-0.5 font-semibold text-blue-600 transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700"
					>{$t('common.nav.faq')}</a
				>
				{$t('home.howItWorks.links', {}).replace('{faq}', '').replace('{privacy}', '')}
				<a
					href="/info/privacy"
					class="rounded px-1 py-0.5 font-semibold text-blue-600 transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700"
					>{$t('common.nav.privacy')}</a
				>.
			</p>
		</div>
	</div>
</div>
