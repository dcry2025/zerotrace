<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../app.css';
	import '$lib/styles/toast.css';

	// Toast options - ensure toasts appear above banner (z-index: 9999)
	const toastOptions = {
		duration: 4000,
		intro: { y: 192 }
	};
</script>

<!-- Toast wrapper with explicit fixed positioning and high z-index -->
<div class="toast-wrapper">
	<SvelteToast options={toastOptions} />
</div>
<slot />

<style>
	/* Ensure toast wrapper is fixed and above everything */
	.toast-wrapper {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		z-index: 10000;
		pointer-events: none;
	}

	.toast-wrapper :global(*) {
		pointer-events: auto;
	}
</style>
