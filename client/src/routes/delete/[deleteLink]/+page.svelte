<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	// Components
	import { Footer, Header } from '$lib/components';
	import { t } from '$lib/i18n/i18n';

	// Get data from load function
	let { data }: { data: PageData } = $props();

	// Reactive state
	let deleting = $state(false);
	let success = $state(data.success);
	let error = $state(data.error);
	let errorMessage = $state(data.errorMessage);
	let confirming = $state(!data.success && !data.error); // Show confirmation if no success/error

	async function handleDelete() {
		if (!confirm($t('delete.confirm.subtitle'))) {
			return;
		}

		deleting = true;
		try {
			const response = await fetch(`/api/notes/delete/${data.deleteLink}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (result.success) {
				success = true;
				confirming = false;
				// Redirect to home after 3 seconds
				setTimeout(() => {
					goto('/');
				}, 3000);
			} else {
				error = true;
				errorMessage = result.message || 'Unknown error';
				confirming = false;
			}
		} catch (err) {
			error = true;
			errorMessage = 'Network error occurred';
			confirming = false;
		} finally {
			deleting = false;
		}
	}

	onMount(() => {
		// If we already have success or error from URL params, show that state
		if (data.success) {
			confirming = false;
			success = true;
			// Redirect to home after 3 seconds
			setTimeout(() => {
				goto('/');
			}, 3000);
		} else if (data.error) {
			confirming = false;
			error = true;
		}
	});
</script>

<svelte:head>
	<title>{$t('delete.success.title')} - zerotrace</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-green-900 to-blue-900">
	<!-- Header -->
	<Header subtitle={$t('delete.title')} />

	<!-- Main Content -->
	<main class="mx-auto flex max-w-4xl flex-1 items-center justify-center px-4 pt-6 lg:px-8 lg:pt-8">
		<div
			class="w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-800/50 p-8 text-center shadow-2xl backdrop-blur-sm"
		>
			{#if confirming}
				<!-- Confirmation State -->
				<div class="animate-fade-in-up">
					<div
						class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-red-500"
					>
						<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
							></path>
						</svg>
					</div>
					<h1 class="mb-4 text-2xl font-bold text-white">{$t('delete.confirm.title')}</h1>
					<p class="mb-6 text-slate-300">{$t('delete.confirm.subtitle')}</p>
					<div class="flex justify-center gap-4">
						<button
							onclick={() => goto('/')}
							class="transform rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-gray-600 hover:to-gray-700 hover:shadow-xl"
						>
							{$t('delete.confirm.cancel')}
						</button>
						<button
							onclick={handleDelete}
							class="transform rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-red-600 hover:to-red-700 hover:shadow-xl"
						>
							{$t('delete.confirm.delete')}
						</button>
					</div>
				</div>
			{:else if deleting}
				<!-- Deleting State -->
				<div class="animate-fade-in-up">
					<div
						class="mx-auto mb-6 flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-red-600"
					>
						<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							></path>
						</svg>
					</div>
					<h1 class="mb-4 text-2xl font-bold text-white">{$t('delete.deleting.title')}</h1>
					<p class="mb-6 text-slate-300">{$t('delete.deleting.subtitle')}</p>
					<div class="flex justify-center">
						<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-red-500"></div>
					</div>
				</div>
			{:else if success}
				<!-- Success State -->
				<div class="animate-fade-in-up">
					<div
						class="animate-bounce-in mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500"
					>
						<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
					</div>
					<h1 class="mb-4 text-2xl font-bold text-white">{$t('delete.success.title')}</h1>
					<p class="mb-6 text-slate-300">{$t('delete.success.subtitle')}</p>
					<div class="mb-6 text-sm text-slate-400">
						{$t('delete.success.redirect')}
					</div>
					<button
						onclick={() => goto('/')}
						class="transform rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
					>
						{$t('delete.success.button')}
					</button>
				</div>
			{:else if error}
				<!-- Error State -->
				<div class="animate-fade-in-up">
					<div
						class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-red-600"
					>
						<svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
							></path>
						</svg>
					</div>
					<h1 class="mb-4 text-2xl font-bold text-white">{$t('delete.error.title')}</h1>
					<p class="mb-6 text-slate-300">{$t('delete.error.subtitle')}</p>
					{#if errorMessage}
						<div
							class="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
						>
							{errorMessage}
						</div>
					{/if}
					<button
						onclick={() => goto('/')}
						class="transform rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
					>
						{$t('delete.error.button')}
					</button>
				</div>
			{/if}
		</div>
	</main>

	<Footer />
</div>
