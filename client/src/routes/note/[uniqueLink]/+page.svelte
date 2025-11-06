<script lang="ts">
	import { page } from '$app/stores';
	import { goto, replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import DOMPurify from 'dompurify';
	import { t, loadTranslations, getInitialLocale } from '$lib/i18n/i18n';
	import type { PageData } from './$types';

	// Services
	import { notesService } from '$lib/services';

	// Crypto
	import { extractKeyFromUrl, isValidKey } from '$lib/crypto';

	// Components
	import { Header, Footer } from '$lib/components';

	// Get server data
	let { data }: { data: PageData } = $props();

	let noteContent = $state('');
	let password = $state('');
	let loading = $state(true);
	let error = $state('');
	let requiresPassword = $state(false);
	let noteRead = $state(false);
	let showConfirmation = $state(false);
	let uniqueLink = $state('');
	let noteKey = $state('');
	let passwordAttempted = $state(false);
	/**
	 * Sanitize text content to prevent XSS
	 * This is an extra layer of protection - the server already sanitizes
	 */
	function sanitizeText(text: string): string {
		// Configure DOMPurify to strip all HTML tags
		return DOMPurify.sanitize(text, {
			ALLOWED_TAGS: [], // No HTML tags allowed
			ALLOWED_ATTR: [], // No attributes allowed
			KEEP_CONTENT: true // Keep the text content
		});
	}

	/**
	 * Sanitize error messages from server to prevent XSS
	 * Extra security layer for error messages
	 */
	function sanitizeErrorMessage(message: string): string {
		if (!message) return '';
		return DOMPurify.sanitize(message, {
			ALLOWED_TAGS: [],
			ALLOWED_ATTR: [],
			KEEP_CONTENT: true
		});
	}

	onMount(async () => {
		// Load translations for this route
		await loadTranslations(getInitialLocale(), window.location.pathname);

		// Get uniqueLink from server data (most reliable)
		uniqueLink = data.uniqueLink;

		// 1. Extract noteKey from URL fragment (#key)
		noteKey = extractKeyFromUrl() || '';

		// 2. Immediately clear fragment from URL (security: don't leave key in browser history)
		// Use SvelteKit's replaceState instead of native history API
		const urlWithoutFragment = window.location.href.split('#')[0];
		replaceState(urlWithoutFragment, {});

		// 3. Validate noteKey
		if (!noteKey || !isValidKey(noteKey)) {
			error = sanitizeErrorMessage(
				'Encryption key missing or invalid in URL. The link may be corrupted.'
			);
			loading = false;
			return;
		}

		// 4. Check note status (client-side for fresh data)
		await checkNoteStatus();
	});

	async function checkNoteStatus() {
		try {
			loading = true;

			const status = await notesService.checkNoteStatus(uniqueLink);

			if (!status.exists) {
				error = sanitizeErrorMessage('Note not found or expired');
				loading = false;
				return;
			}

			if (status.isRead) {
				error = sanitizeErrorMessage('This note has already been read and is no longer available');
				loading = false;
				return;
			}

			// Note is available - show appropriate screen
			if (status.hasPassword) {
				requiresPassword = true;
			} else {
				showConfirmation = true;
			}
		} catch (err: any) {
			console.error('Error checking note status:', err);
			error = sanitizeErrorMessage('Failed to load note. Please try again.');
		} finally {
			loading = false;
		}
	}

	async function loadNote() {
		try {
			loading = true;

			// Pass noteKey for decryption
			const response = await notesService.readNote(uniqueLink, noteKey, password || undefined);

			// Service returns: { content } - content is already decrypted
			// Sanitize content for extra security (defense in depth)
			const rawContent = response.content || '';
			noteContent = sanitizeText(rawContent);
			noteRead = true;
			requiresPassword = false;
			showConfirmation = false;
			error = '';
		} catch (err: any) {
			console.error('Error loading note:', err);

			// Extract error message from ky error
			if (err?.response) {
				try {
					const errorData = await err.response.json();
					const errorMessage = errorData.message || '';

					// Check for incorrect password FIRST (before generic 401 check)
					// Only show toast if user actually attempted to enter a password
					if (errorMessage.includes('Incorrect password') && passwordAttempted) {
						// Reset to password form and hide confirmation
						requiresPassword = true;
						showConfirmation = false;
						error = ''; // Don't set error to keep password form visible
						toast.push('Incorrect password', {
							theme: {
								'--toastBackground': '#EF4444',
								'--toastColor': '#FFFFFF',
								'--toastBarBackground': '#DC2626'
							}
						});
					} else if (err.response.status === 401 || errorMessage.includes('Password required')) {
						// Password is required but not provided yet
						requiresPassword = true;
						showConfirmation = false;
						error = '';
					} else {
						// Other errors - show error screen
						showConfirmation = false;
						requiresPassword = false;
						error = sanitizeErrorMessage(errorMessage || 'Note not found or expired');
					}
				} catch {
					showConfirmation = false;
					requiresPassword = false;
					error = sanitizeErrorMessage('Failed to load note. Please try again.');
				}
			} else {
				showConfirmation = false;
				requiresPassword = false;
				error = sanitizeErrorMessage('Failed to load note. Please check your connection.');
			}
		} finally {
			loading = false;
		}
	}

	async function handlePasswordSubmit() {
		passwordAttempted = true; // Mark that user has attempted password entry
		// After entering password, read note directly (no confirmation needed)
		requiresPassword = false;
		await loadNote();
	}

	async function handleConfirmRead() {
		if (loading) return; // Prevent double-click
		showConfirmation = false;
		await loadNote();
	}

	async function handleCancelRead() {
		// Clear sensitive data before leaving
		password = '';
		passwordAttempted = false;
		// Use SvelteKit navigation to go back to home
		await goto('/');
	}
</script>

<svelte:head>
	<title>{$t('note.loading.title')} - zerotrace</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
	<!-- Header -->
	<Header subtitle={$t('note.loading.title')} />

	<!-- Main Content -->
	<main class="mx-auto max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
		{#if loading}
			<!-- Loading State -->
			<div class="text-center">
				<div
					class="mx-auto mb-6 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-blue-500 shadow-xl"
				>
					<svg class="h-10 w-10 animate-spin text-white" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				</div>
				<h2 class="mb-4 text-3xl font-bold text-gray-900">{$t('note.loading.title')}</h2>
				<p class="text-lg text-gray-600">{$t('note.loading.subtitle')}</p>
			</div>
		{:else if error}
			<!-- Error State -->
			<div class="text-center">
				<div
					class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-red-400 to-pink-500 shadow-xl"
				>
					<svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
						></path>
					</svg>
				</div>
				<h2 class="mb-4 text-3xl font-bold text-gray-900">{$t('note.error.title')}</h2>
				<p class="mx-auto mb-8 max-w-md text-lg text-gray-600">
					{error}. {$t('note.error.subtitle')}
				</p>

				<div class="mx-auto max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
					<h3 class="mb-4 text-lg font-semibold text-gray-900">{$t('note.error.whatHappened')}</h3>
					<div class="space-y-3 text-left text-sm text-gray-600">
						<div class="flex items-start space-x-2">
							<div class="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-400"></div>
							<span>{$t('note.error.reason1')}</span>
						</div>
						<div class="flex items-start space-x-2">
							<div class="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-400"></div>
							<span>{$t('note.error.reason2')}</span>
						</div>
						<div class="flex items-start space-x-2">
							<div class="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-400"></div>
							<span>{$t('note.error.reason3')}</span>
						</div>
					</div>
				</div>

				<div class="mt-8">
					<a
						href="/"
						class="inline-block transform rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-purple-600 hover:to-blue-600 hover:shadow-xl"
					>
						{$t('note.error.createNew')}
					</a>
				</div>
			</div>
		{:else if showConfirmation}
			<!-- Confirmation Screen -->
			<div class="mx-auto max-w-2xl">
				<div class="mb-8 text-center">
					<div
						class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-purple-500 shadow-xl"
					>
						<svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							></path>
						</svg>
					</div>
					<h2 class="mb-4 text-3xl font-bold text-gray-900">{$t('note.confirm.title')}</h2>
					<p class="text-lg text-gray-600">{$t('note.confirm.subtitle')}</p>
				</div>

				<div class="mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
					<!-- Warning Section -->
					<div
						class="border-b border-orange-200 bg-gradient-to-r from-yellow-50 to-orange-50 px-8 py-6"
					>
						<div class="flex items-start space-x-3">
							<div
								class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500"
							>
								<svg
									class="h-5 w-5 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
									></path>
								</svg>
							</div>
							<div>
								<h4 class="mb-2 text-lg font-semibold text-gray-900">
									{$t('note.confirm.warning')}
								</h4>
								<p class="text-gray-700">
									{$t('note.confirm.warningText')}
								</p>
							</div>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="space-y-4 p-8">
						<button
							onclick={handleConfirmRead}
							disabled={loading}
							class="flex w-full transform items-center justify-center space-x-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								></path>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								></path>
							</svg>
							<span>{$t('note.confirm.readButton')}</span>
						</button>

						<button
							onclick={handleCancelRead}
							disabled={loading}
							class="flex w-full items-center justify-center space-x-3 rounded-xl bg-gray-100 px-6 py-4 font-bold text-gray-700 transition-all duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								></path>
							</svg>
							<span>{$t('note.confirm.cancelButton')}</span>
						</button>
					</div>
				</div>
			</div>
		{:else if requiresPassword}
			<!-- Password Required State -->
			<div class="mx-auto max-w-[360px]">
				<div class="mb-8 text-center">
					<div
						class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-xl"
					>
						<svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							></path>
						</svg>
					</div>
					<h2 class="mb-4 text-3xl font-bold text-gray-900">{$t('note.password.title')}</h2>
					<p class="text-lg text-gray-600">{$t('note.password.subtitle')}</p>
				</div>

				<div class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
					<div class="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-6">
						<div class="flex items-center space-x-3">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
								<svg
									class="h-5 w-5 text-white"
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
							</div>
							<h3 class="text-xl font-bold text-white">{$t('note.password.label')}</h3>
						</div>
					</div>

					<div class="p-8">
						<form
							onsubmit={(e) => {
								e.preventDefault();
								handlePasswordSubmit();
							}}
							class="space-y-6"
						>
							<div>
								<label for="password" class="mb-3 block text-sm font-semibold text-gray-700">
									<div class="flex items-center space-x-2">
										<svg
											class="h-5 w-5 text-yellow-500"
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
										<span>{$t('note.password.label')}</span>
									</div>
								</label>
								<input
									id="password"
									type="password"
									bind:value={password}
									placeholder={$t('note.password.placeholder')}
									class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
									required
								/>
							</div>

							<button
								type="submit"
								disabled={loading}
								class="flex w-full transform items-center justify-center space-x-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-yellow-600 hover:to-orange-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
							>
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>{$t('note.password.unlock')}</span>
							</button>
						</form>
					</div>
				</div>
			</div>
		{:else if noteRead}
			<!-- Note Content State -->
			<div class="mb-8 text-center">
				<div
					class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 shadow-xl"
				>
					<svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
				</div>
				<h2 class="mb-4 text-3xl font-bold text-gray-900">{$t('note.success.title')}</h2>
				<p class="text-lg text-gray-600">{$t('note.success.subtitle')}</p>
			</div>

			<div class="mb-12 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
				<div class="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-6">
					<div class="flex items-center space-x-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
							<svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								></path>
							</svg>
						</div>
						<h3 class="text-xl font-bold text-white">{$t('note.success.messageTitle')}</h3>
					</div>
				</div>

				<div class="p-8">
					<div
						class="note-container overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-6"
					>
						<pre
							class="note-content overflow-wrap-anywhere word-break-break-all max-w-full hyphens-auto whitespace-pre-wrap break-all font-medium leading-relaxed text-gray-900">{noteContent}</pre>
					</div>

					<!-- Security Notice -->
					<div
						class="mt-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-6"
					>
						<div class="flex items-start space-x-3">
							<div
								class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-red-400 to-pink-500"
							>
								<svg
									class="h-5 w-5 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
									></path>
								</svg>
							</div>
							<div>
								<h4 class="mb-2 text-lg font-semibold text-red-800">
									{$t('note.success.deleted')}
								</h4>
								<p class="text-sm text-red-700">
									{$t('note.success.deletedText')}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="text-center">
				<a
					href="/"
					class="inline-block transform rounded-xl bg-gradient-to-r from-green-500 to-blue-500 px-8 py-4 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-green-600 hover:to-blue-600 hover:shadow-xl"
				>
					{$t('note.success.createNew')}
				</a>
			</div>
		{/if}
	</main>

	<!-- Footer -->
	<Footer />
</div>

<style>
	/* Mobile-specific text wrapping for note content */
	@media (max-width: 768px) {
		.note-content {
			word-break: break-all !important;
			overflow-wrap: anywhere !important;
			hyphens: auto !important;
			white-space: pre-wrap !important;
			max-width: 100% !important;
			overflow: hidden !important;
		}

		.note-container {
			overflow-x: hidden !important;
			max-width: 100% !important;
		}
	}
</style>
