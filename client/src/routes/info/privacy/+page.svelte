<script lang="ts">
	import { Header, Footer, CONTACTS } from '$lib';
	import { t, loadTranslations, getInitialLocale } from '$lib/i18n/i18n';
	import { onMount } from 'svelte';

	onMount(async () => {
		// Ensure translations are loaded when navigating directly to this route
		await loadTranslations(getInitialLocale(), window.location.pathname);
	});
</script>

<svelte:head>
	<title>{$t('privacy.title')}</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
	<Header subtitle={$t('privacy.title')} showBackButton={true} />

	<!-- Main Content -->
	<main class="mx-auto max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
		<div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
			<div class="p-8">
				<div class="prose max-w-none">
					<div class="mb-8 text-sm text-gray-500">{$t('privacy.lastModified')}</div>
					{@html $t('privacy.body')}
					<!-- Contact banner with i18n labels -->
					<div
						class="mt-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6"
					>
						<h3 class="mb-4 text-lg font-semibold text-gray-900">
							{$t('privacy.banner.getInTouch')}
						</h3>
						<div class="space-y-4">
							<!-- <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">{$t('privacy.banner.twitter')}</p>
                  <a href={CONTACTS.TWITTER.url} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 font-semibold hover:underline">@{CONTACTS.TWITTER.username}</a>
                </div>
              </div> -->
							<div class="flex items-center space-x-3">
								<div
									class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-400 to-cyan-500"
								>
									<svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24"
										><path
											d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.566-4.458c.538-.196 1.006.128.832.941z"
										/></svg
									>
								</div>
								<div>
									<p class="text-sm font-medium text-gray-700">{$t('privacy.banner.telegram')}</p>
									<a
										href={CONTACTS.TELEGRAM.url}
										target="_blank"
										rel="noopener noreferrer"
										class="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
										>@{CONTACTS.TELEGRAM.username}</a
									>
								</div>
							</div>
						</div>
						<div class="mt-6 border-t border-blue-200 pt-6">
							<p class="text-sm text-gray-600">
								<strong>{$t('privacy.banner.responseTimeLabel')}</strong>
								{$t('privacy.banner.responseTimeText')}<br />
								<strong>{$t('privacy.banner.securityIssuesLabel')}</strong>
								{$t('privacy.banner.securityIssuesText')}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>

	<Footer />
</div>
