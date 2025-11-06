<script lang="ts">
	// Components
	import CryptoDonations from '../common/CryptoDonations.svelte';
	import LanguageSwitcher from '../common/LanguageSwitcher.svelte';
	import { t } from '$lib/i18n/i18n';
	import { CONTACTS } from '$lib';
	const year = new Date().getFullYear();
</script>

<footer class="mt-10 min-h-[400px] border-t border-gray-200 bg-white">
	<div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
		<!-- Mobile Layout (centered) -->
		<div class="md:hidden">
			<!-- Brand Section -->
			<div class="mb-8 text-center">
				<div class="mb-4 flex items-center justify-center space-x-3">
					<div class="text-3xl">🔒</div>
					<div>
						<h3 class="text-xl font-bold text-gray-900">zer🔐trace</h3>
						<p class="text-sm text-gray-500">{$t('common.footer.brandTag')}</p>
					</div>
				</div>
				<p
					class="mx-auto flex min-h-[3rem] max-w-sm items-center justify-center text-sm text-gray-600"
				>
					{$t('common.footer.brandDesc')}
				</p>
			</div>

			<!-- Support Links -->
			<div class="mb-6 text-center">
				<h4 class="mb-4 text-sm font-semibold text-gray-900">{$t('common.footer.support')}</h4>
				<div class="space-y-2">
					<a
						href="/info/privacy"
						class="block text-sm text-gray-600 transition-colors hover:text-blue-600"
						>{$t('common.nav.privacy')}</a
					>
					<a
						href="/info/faq"
						class="block text-sm text-gray-600 transition-colors hover:text-blue-600"
						>{$t('common.nav.faq')}</a
					>
				</div>
			</div>

			<!-- Social Links -->
			<div class="mb-6 text-center">
				<h4 class="mb-4 text-sm font-semibold text-gray-900">{$t('common.footer.connect')}</h4>
				<div class="flex justify-center space-x-8">
					<a
						href={CONTACTS.TELEGRAM.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex flex-col items-center"
					>
						<svg
							class="h-8 w-8 fill-current text-gray-600 transition-colors group-hover:text-[#0088cc]"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"
							/>
						</svg>
						<span
							class="mt-2 block text-xs text-gray-600 transition-colors group-hover:text-[#0088cc]"
							>Telegram</span
						>
					</a>
				</div>
			</div>

			<!-- Language Selector -->
			<div class="mb-6 flex justify-center">
				<LanguageSwitcher />
			</div>

			<!-- Donation Section (Mobile) -->
			<div class="mb-6 text-center">
				<div class="mb-4 flex items-center justify-center gap-2">
					<h4 class="text-sm font-semibold text-gray-900">{$t('common.footer.donate')}</h4>
					<div class="group relative inline-block">
						<button
							class="inline-flex h-5 w-5 cursor-help items-center justify-center text-xs text-blue-600 transition-colors hover:text-blue-700"
							aria-label="Donation information"
						>
							<svg
								class="h-5 w-5"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
						<!-- Tooltip -->
						<div
							class="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-3 text-center text-xs text-white opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100"
						>
							<div class="relative">
								<p class="leading-relaxed">{$t('common.footer.donateInfo')}</p>
								<!-- Arrow -->
								<div class="absolute left-1/2 top-full -mt-1 -translate-x-1/2">
									<div class="h-2 w-2 rotate-45 transform bg-gray-900"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<CryptoDonations isMobile={true} />
			</div>
		</div>

		<!-- Desktop Layout -->
		<div class="hidden grid-cols-4 gap-8 md:grid">
			<!-- Brand Column -->
			<div class="col-span-1">
				<div class="mb-4 flex items-center space-x-3">
					<div>
						<h3 class="text-lg font-bold text-gray-900">zer🔐trace</h3>
						<p class="text-xs text-gray-500">{$t('common.footer.brandTag')}</p>
					</div>
				</div>
				<p class="mb-4 flex min-h-[3rem] items-center text-sm text-gray-600">
					{$t('common.footer.brandDesc')}
				</p>
			</div>

			<!-- Links Column -->
			<div>
				<h4 class="mb-4 text-sm font-semibold text-gray-900">{$t('common.footer.support')}</h4>
				<div class="space-y-2">
					<a
						href="/info/privacy"
						class="block text-sm text-gray-600 transition-colors hover:text-blue-600"
						>{$t('common.nav.privacy')}</a
					>
					<a
						href="/info/faq"
						class="block text-sm text-gray-600 transition-colors hover:text-blue-600"
						>{$t('common.nav.faq')}</a
					>
				</div>
			</div>

			<!-- Social & Language Column -->
			<div>
				<h4 class="mb-4 text-sm font-semibold text-gray-900">{$t('common.footer.connect')}</h4>
				<div class="mb-4 space-y-3">
					<a
						href={CONTACTS.TELEGRAM.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex items-center space-x-2 text-sm text-gray-600 transition-colors hover:text-[#0088cc]"
					>
						<svg
							class="h-5 w-5 fill-current"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"
							/>
						</svg>
						<span>Telegram</span>
					</a>
				</div>

				<div class="mt-4">
					<LanguageSwitcher />
				</div>
			</div>

			<!-- Donation Column (Desktop) -->
			<div>
				<div class="mb-4 flex items-center gap-2">
					<h4 class="text-sm font-semibold text-gray-900">{$t('common.footer.donate')}</h4>
					<div class="group relative inline-block">
						<button
							class="inline-flex h-5 w-5 cursor-help items-center justify-center text-xs text-blue-600 transition-colors hover:text-blue-700"
							aria-label="Donation information"
						>
							<svg
								class="h-5 w-5"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
						<!-- Tooltip -->
						<div
							class="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-3 text-center text-xs text-white opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100"
						>
							<div class="relative">
								<p class="leading-relaxed">{$t('common.footer.donateInfo')}</p>
								<!-- Arrow -->
								<div class="absolute left-1/2 top-full -mt-1 -translate-x-1/2">
									<div class="h-2 w-2 rotate-45 transform bg-gray-900"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<CryptoDonations isMobile={false} />
			</div>
		</div>

		<!-- Bottom Line -->
		<div
			class="mt-8 flex min-h-[2.5rem] items-center justify-center border-t border-gray-200 pt-6 text-center"
		>
			<p class="text-sm text-gray-500">
				{$t('common.footer.copyright').replace('{year}', year.toString())}
			</p>
		</div>
	</div>
</footer>
