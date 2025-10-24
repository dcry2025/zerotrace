<script lang="ts">
  import { Header, Footer, HeroSection, FeaturesSection, HowItWorksSection, NoteCreationForm } from '$lib';
</script>

<svelte:head>
  <title>zerotrace - Secure Private Notes</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
  <Header />

  <!-- Main Content -->
  <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
    <HeroSection />
    <NoteCreationForm />
    <FeaturesSection />
    <HowItWorksSection />
  </main>

  <Footer />
</div>