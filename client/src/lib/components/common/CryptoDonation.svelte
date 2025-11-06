<script lang="ts">
	/**
	 * Single cryptocurrency donation item with address and copy functionality
	 */
	import CryptoIcon from './CryptoIcon.svelte';

	interface Props {
		type: 'btc' | 'eth'; //| 'xmr' | 'zec';
		name: string;
		address: string;
		isMobile?: boolean;
		copiedCoin: string | null;
		onCopy: (address: string, coin: string) => void;
	}

	let { type, name, address, isMobile = false, copiedCoin, onCopy }: Props = $props();

	const coinCode = type.toUpperCase();
	const isCopied = $derived(copiedCoin === coinCode);

	// Truncate address for mobile display
	function truncateAddress(addr: string): string {
		if (addr.length <= 20) return addr;
		return `${addr.slice(0, 10)}...${addr.slice(-10)}`;
	}

	const displayAddress = $derived(isMobile ? truncateAddress(address) : address);
</script>

<div
	class="transition-all duration-300"
	class:bg-gray-50={isMobile}
	class:rounded-lg={true}
	class:p-3={isMobile}
	class:p-2={!isMobile}
	class:bg-green-50={isCopied}
	class:ring-2={isCopied}
	class:ring-green-500={isCopied}
>
	<div class="flex items-center justify-between" class:mb-1={!isMobile}>
		<div class="flex items-center space-x-2">
			<CryptoIcon {type} size={20} />
			<span class="text-xs font-medium text-gray-700">{name}</span>
		</div>
		<button
			onclick={() => onCopy(address, coinCode)}
			class="text-xs font-medium transition-all duration-200"
			class:text-green-600={isCopied}
			class:text-blue-600={!isCopied}
			class:hover:text-blue-700={!isCopied}
			title={isCopied ? 'Copied!' : 'Copy address'}
		>
			{#if isCopied}
				✓ Copied!
			{:else}
				📋 Copy
			{/if}
		</button>
	</div>
	<p
		class="break-all font-mono text-xs text-gray-600"
		class:mt-1={isMobile}
		class:leading-relaxed={!isMobile}
	>
		{displayAddress}
	</p>
</div>
