<script lang="ts">
	import {
		Header,
		Footer,
		HeroSection,
		FeaturesSection,
		HowItWorksSection,
		NoteCreationForm
	} from '$lib';
</script>

<svelte:head>
	<title>zerotrace - Secure Private Notes</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
	<Header />

	<!-- Main Content -->
	<main class="mx-auto max-w-4xl flex-1 px-4 py-6 sm:px-6 md:py-12 lg:px-8">
		<HeroSection />
		<NoteCreationForm />
		<FeaturesSection />
		<HowItWorksSection />
	</main>

	<Footer />
</div>
