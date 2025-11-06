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

	const currentLanguage = $derived(languages.find((lang) => lang.code === $locale) || languages[0]);

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
		onclick={() => (isOpen = !isOpen)}
		class="flex items-center space-x-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 transition-colors duration-200 hover:bg-gray-200"
		aria-label={$t('common.language.select')}
	>
		<span class="text-xl">{currentLanguage.flag}</span>
		<span class="hidden text-sm font-medium text-gray-700 sm:inline">{currentLanguage.name}</span>
		<svg
			class="h-4 w-4 text-gray-600 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"
			></path>
		</svg>
	</button>

	{#if isOpen}
		<div
			class="absolute bottom-full right-0 z-50 mb-2 max-h-64 w-48 overflow-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl sm:bottom-full sm:mb-2 md:bottom-full md:mb-2"
			transition:slide={{ duration: 200, axis: 'y' }}
		>
			{#each languages as language}
				<button
					onclick={() => handleLanguageChange(language.code)}
					class="flex w-full items-center space-x-3 px-3 py-2 transition-colors duration-150 hover:bg-gray-50 {$locale ===
					language.code
						? 'bg-blue-50'
						: ''}"
				>
					<span class="text-lg">{language.flag}</span>
					<div class="flex-1 text-left">
						<div class="text-sm font-medium text-gray-900">{language.name}</div>
						<div class="text-xs text-gray-500">{language.code.toUpperCase()}</div>
					</div>
					{#if $locale === language.code}
						<svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							></path>
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
