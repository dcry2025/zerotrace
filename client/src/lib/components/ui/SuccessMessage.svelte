<script lang="ts">
  import { t } from '$lib/i18n/i18n';

  // Props
  let { title, subtitle }: { title: string; subtitle: string } = $props();
</script>

<!-- Success Message -->
<div class="text-center mb-12">
  <div
    class="w-20 h-20 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  </div>
  <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
  <p class="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-2">{subtitle}</p>
</div>
