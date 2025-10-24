<script lang="ts">
  /**
   * List of cryptocurrency donations
   */
  import CryptoDonation from './CryptoDonation.svelte';
  import { CRYPTO_DONATIONS } from '$lib';
  
  interface Props {
    isMobile?: boolean;
  }
  
  let { isMobile = false }: Props = $props();
  
  // Donation addresses from constants
  const donationAddresses = {
    btc: CRYPTO_DONATIONS.BTC,
    eth: CRYPTO_DONATIONS.ETH,
    // xmr: CRYPTO_DONATIONS.XMR,
    // zec: CRYPTO_DONATIONS.ZEC
  };
  
  // Cryptocurrency list
  const cryptos = [
    { type: 'btc' as const, name: 'Bitcoin', address: donationAddresses.btc },
    { type: 'eth' as const, name: 'Ethereum', address: donationAddresses.eth },
    // { type: 'xmr' as const, name: 'Monero', address: donationAddresses.xmr },
    // { type: 'zec' as const, name: 'Zcash', address: donationAddresses.zec }
  ];
  
  // Track which coin was just copied
  let copiedCoin = $state<string | null>(null);
  
  // Copy address to clipboard with beautiful feedback
  async function copyAddress(address: string, coin: string) {
    try {
      await navigator.clipboard.writeText(address);
      copiedCoin = coin;
      // Reset after 2 seconds
      setTimeout(() => {
        copiedCoin = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy address. Please try again.');
    }
  }
</script>

<div class="space-y-3">
  {#each cryptos as crypto (crypto.type)}
    <CryptoDonation
      type={crypto.type}
      name={crypto.name}
      address={crypto.address}
      {isMobile}
      {copiedCoin}
      onCopy={copyAddress}
    />
  {/each}
</div>

