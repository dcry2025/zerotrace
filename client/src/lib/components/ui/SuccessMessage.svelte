<script lang="ts">
	import { t } from '$lib/i18n/i18n';

	// Props
	let { title, subtitle }: { title: string; subtitle: string } = $props();
</script>

<!-- Success Message -->
<div class="mb-12 text-center">
	<div
		class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-cyan-500 shadow-xl"
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
	<h2 class="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">{title}</h2>
	<p class="mx-auto max-w-2xl px-2 text-lg leading-relaxed text-slate-300 sm:text-xl">{subtitle}</p>
</div>
