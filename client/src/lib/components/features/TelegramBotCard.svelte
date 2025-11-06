<script lang="ts">
	import { slide } from 'svelte/transition';
	import { t } from '$lib/i18n/i18n';
	import DOMPurify from 'dompurify';

	// Props
	let {
		botInfo,
		uniqueLink,
		loadingBotInfo,
		onOpenBot
	}: {
		botInfo: { username: string | null; link: string | null; ready: boolean } | null;
		uniqueLink: string;
		loadingBotInfo: boolean;
		onOpenBot: () => void;
	} = $props();

	// Reactive
	const showCard = $derived(botInfo !== null);
	const botUsername = $derived(botInfo?.username || null);
	const botLink = $derived(botInfo?.link || null);
	const isBotReady = $derived(botInfo?.ready || false);

	/**
	 * Sanitize text to prevent XSS attacks
	 */
	function sanitizeText(text: string | null | undefined): string {
		if (!text) return '';
		return DOMPurify.sanitize(text, {
			ALLOWED_TAGS: [],
			ALLOWED_ATTR: [],
			KEEP_CONTENT: true
		});
	}
</script>

<!-- Telegram Bot Integration -->
{#if showCard}
	<div
		class="mb-12 overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 shadow-2xl backdrop-blur-sm"
		transition:slide={{ duration: 400 }}
	>
		<!-- Card Header -->
		<div
			class="border-b border-blue-500/30 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 px-4 py-4 backdrop-blur-sm sm:px-8 sm:py-6"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500"
					>
						<svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.566-4.458c.538-.196 1.006.128.832.941z"
							/>
						</svg>
					</div>
					<div class="min-w-0 flex-1">
						<h3 class="text-lg font-bold text-white sm:text-xl">{$t('created.telegram.title')}</h3>
						<p class="text-xs text-blue-100 sm:text-sm">{$t('created.telegram.subtitle')}</p>
					</div>
				</div>
				<div
					class="rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1 text-xs font-bold text-green-300"
				>
					{$t('created.telegram.status')}
				</div>
			</div>
		</div>

		<!-- Card Content -->
		<div class="p-3 sm:p-8">
			<div class="space-y-4 sm:space-y-6">
				<!-- Status Info -->
				<div class="flex flex-col space-y-4">
					<div class="flex items-start space-x-3">
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/20 sm:h-12 sm:w-12"
						>
							<svg
								class="h-4 w-4 text-blue-300 sm:h-6 sm:w-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</div>
						<div class="min-w-0 flex-1">
							<h4 class="mb-2 text-sm font-semibold text-white sm:text-lg">
								{$t('created.telegram.activate')}
							</h4>
							<p class="mb-4 text-xs leading-relaxed text-blue-100 sm:text-sm">
								{$t('created.telegram.description')}
							</p>
						</div>
					</div>

					<!-- Bot and Note ID Info -->
					<div class="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm sm:p-4">
						<div class="space-y-3">
							<div class="flex items-center space-x-2">
								<span class="text-base text-blue-300 sm:text-lg">🤖</span>
								<span class="text-xs font-medium text-white sm:text-sm"
									>{$t('created.telegram.bot')}</span
								>
								{#if botUsername}
									<code
										class="break-all rounded bg-cyan-500/20 px-2 py-1 font-mono text-xs text-cyan-300 sm:text-sm"
										>@{sanitizeText(botUsername)}</code
									>
								{:else}
									<span class="text-xs text-slate-400 sm:text-sm">Loading...</span>
								{/if}
							</div>
							<div class="flex items-start space-x-2">
								<span class="mt-0.5 text-base text-blue-300 sm:text-lg">🔗</span>
								<div class="min-w-0 flex-1">
									<span class="mb-1 block text-xs font-medium text-white sm:text-sm"
										>{$t('created.telegram.noteId')}</span
									>
									<code
										class="block w-full break-all rounded bg-cyan-500/20 px-2 py-1 font-mono text-xs text-cyan-300 sm:text-sm"
										>{sanitizeText(uniqueLink)}</code
									>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Steps to Activate -->
				<div
					class="rounded-2xl border border-slate-600/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-3 backdrop-blur-sm sm:p-6"
				>
					<h4
						class="mb-3 flex items-center space-x-2 text-sm font-bold text-white sm:mb-4 sm:text-lg"
					>
						<span class="text-lg sm:text-2xl">📋</span>
						<span>{$t('created.telegram.setup')}</span>
					</h4>
					<ol class="space-y-2 text-white sm:space-y-3">
						<li class="flex items-start space-x-2 sm:space-x-3">
							<span
								class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold sm:h-6 sm:w-6 sm:text-sm"
								>1</span
							>
							<span class="flex-1 text-xs leading-relaxed sm:text-sm"
								>{$t('created.telegram.step1')}</span
							>
						</li>
						<li class="flex items-start space-x-2 sm:space-x-3">
							<span
								class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold sm:h-6 sm:w-6 sm:text-sm"
								>2</span
							>
							<span class="flex-1 text-xs leading-relaxed sm:text-sm"
								>{$t('created.telegram.step2').split('Press ')[0]}Press
								<code class="rounded bg-slate-600 px-1 py-0.5 text-xs text-cyan-300 sm:px-2"
									>START</code
								>
								or send
								<code class="rounded bg-slate-600 px-1 py-0.5 text-xs text-cyan-300 sm:px-2"
									>/start</code
								></span
							>
						</li>
						<li class="flex items-start space-x-2 sm:space-x-3">
							<span
								class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold sm:h-6 sm:w-6 sm:text-sm"
								>✓</span
							>
							<span class="flex-1 text-xs leading-relaxed sm:text-sm"
								>{$t('created.telegram.step3')}</span
							>
						</li>
					</ol>
				</div>

				<!-- Action Button -->
				<div class="px-0 sm:px-2">
					<button
						onclick={onOpenBot}
						disabled={!botLink}
						class="flex w-full transform items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-blue-600 hover:to-cyan-600 hover:shadow-2xl disabled:transform-none disabled:from-slate-600 disabled:to-slate-700 sm:space-x-3 sm:px-6 sm:py-4 sm:text-lg"
					>
						<svg class="h-4 w-4 sm:h-7 sm:w-7" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.566-4.458c.538-.196 1.006.128.832.941z"
							/>
						</svg>
						<span class="hidden sm:inline">{$t('created.telegram.openBot')}</span>
						<span class="sm:hidden">{$t('created.telegram.openBot')}</span>
						<svg
							class="h-4 w-4 sm:h-5 sm:w-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
							></path>
						</svg>
					</button>
				</div>

				<!-- Additional Info -->
				<div class="space-y-2 sm:space-y-3">
					<div class="flex items-start space-x-2 text-xs text-blue-200 sm:text-sm">
						<svg
							class="mt-0.5 h-4 w-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							></path>
						</svg>
						<span class="leading-relaxed">{$t('created.telegram.privacy')}</span>
					</div>
					<div class="flex items-start space-x-2 text-xs text-blue-200 sm:text-sm">
						<svg
							class="mt-0.5 h-4 w-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1-1.964-1-2.732 0L3.34 16c-.768 1.333.192 3 1.732 3z"
							></path>
						</svg>
						<span class="leading-relaxed">{$t('created.telegram.emergency')}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
