<script lang="ts">
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n/i18n';

	// Props
	let {
		uniqueLink,
		onDestroy,
		destroying,
		destroyed
	}: {
		uniqueLink: string;
		onDestroy: () => Promise<void>;
		destroying: boolean;
		destroyed: boolean;
	} = $props();

	// Reactive
	const showDestroyButton = $derived(!destroyed);
	const buttonText = $derived(
		destroying ? $t('created.destroy.destroying') : $t('created.destroy.button')
	);
	const buttonIcon = $derived(destroying ? 'spinner' : 'trash');

	// Effect for redirect after destruction
	$effect(() => {
		if (destroyed) {
			setTimeout(() => {
				goto('/');
			}, 2000);
		}
	});
</script>

<!-- Destroy Note Button -->
{#if showDestroyButton}
	<div class="mb-4 px-4 md:mb-8 md:px-8" transition:slide={{ duration: 300 }}>
		<button
			onclick={onDestroy}
			disabled={destroying}
			class="flex w-full transform items-center justify-center space-x-2 rounded-2xl border border-red-400/30 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-red-600 hover:to-red-700 hover:shadow-2xl disabled:transform-none disabled:from-slate-600 disabled:to-slate-700 sm:space-x-3 sm:px-6 sm:py-4 sm:text-lg"
		>
			{#if destroying}
				<svg class="h-6 w-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					></path>
				</svg>
				<span>{buttonText}</span>
			{:else}
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					></path>
				</svg>
				<span>{buttonText}</span>
			{/if}
		</button>
		<p class="mt-3 px-2 text-center text-xs text-slate-400 sm:text-sm">
			{$t('created.destroy.description')}
		</p>
	</div>
{:else}
	<div
		class="mb-12 rounded-3xl border border-green-500/30 bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-8 px-10 shadow-2xl backdrop-blur-sm"
		transition:slide={{ duration: 400 }}
	>
		<div class="flex items-center justify-center space-x-3">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
			>
				<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
					></path>
				</svg>
			</div>
			<div>
				<h3 class="text-2xl font-bold text-white">{$t('created.destroy.success')}</h3>
				<p class="text-sm text-green-200">{$t('created.destroy.redirect')}</p>
			</div>
		</div>
	</div>
{/if}
