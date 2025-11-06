<script lang="ts">
	import { t } from '$lib/i18n/i18n';
	import Banner from '$lib/components/ui/Banner.svelte';

	interface Props {
		subtitle?: string;
		showBackButton?: boolean;
		showBanner?: boolean;
		/** Banner variant: 'ads' or 'info' */
		bannerVariant?: 'ads' | 'info';
		/** Custom ad text for ads variant */
		bannerAdText?: string;
	}

	let {
		subtitle = undefined,
		showBackButton = false,
		showBanner = true,
		bannerVariant = 'ads',
		bannerAdText = ''
	}: Props = $props();
</script>

{#if showBanner}
	<Banner variant={bannerVariant} adText={bannerAdText} />
{/if}

<header class="border-b border-gray-200 bg-white shadow-sm">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<div class="flex min-h-16 items-center justify-between py-2">
			<a href="/" class="flex items-center space-x-3 transition-opacity hover:opacity-80">
				<div>
					<h1 class="text-xl font-bold text-gray-900 sm:text-2xl">zer🔐trace</h1>
					<p class="text-xs text-gray-500 sm:text-sm">{subtitle ?? $t('common.app.tagline')}</p>
				</div>
			</a>

			{#if showBackButton}
				<a
					href="/"
					class="group flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm"
				>
					<svg
						class="h-4 w-4 text-gray-600 transition-colors group-hover:text-indigo-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						></path>
					</svg>
					<span
						class="text-sm font-medium text-gray-700 transition-colors group-hover:text-indigo-700"
					>
						{$t('common.nav.back')}
					</span>
				</a>
			{/if}
		</div>
	</div>
</header>
