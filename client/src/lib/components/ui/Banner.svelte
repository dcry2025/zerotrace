<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { t } from '$lib/i18n/i18n';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Banner variant: 'ads' - advertising, 'info' - custom content */
		variant?: 'ads' | 'info';
		/** Custom ad text (for 'ads' variant, if no children provided) */
		adText?: string;
		/** Custom background gradient */
		gradient?: string;
		/** Custom icon emoji */
		icon?: string;
		/** Enable rainbow color animation for text (ads variant) */
		rainbowText?: boolean;
		/** Enable typewriter effect (ads variant) */
		typewriterEffect?: boolean;
		/** Allow user to close banner (auto false if adText is provided - paid ad) */
		dismissible?: boolean;
		/** Children snippet - works for both variants */
		children?: Snippet;
	}

	let {
		variant = 'ads',
		adText = '',
		gradient = 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
		icon = '📢',
		rainbowText = true,
		typewriterEffect = true,
		dismissible, // Can override, but default is calculated below
		children
	}: Props = $props();

	// Logic: paid ads (with adText) cannot be closed unless explicitly allowed
	const canClose = $derived(dismissible !== undefined ? dismissible : adText === '');

	// JS animation for banner
	let bannerText = $state('');
	let currentCharIndex = $state(0);
	let colorHue = $state(0);
	let bannerVisible = $state(false);
	let shouldShowBanner = $state(false);
	let isTextTooLong = $state(false);
	let textElement = $state<HTMLSpanElement>();

	// Determine if we use typewriter (ads without children)
	const useTypewriter = variant === 'ads' && typewriterEffect && !children;

	// Get ad text from i18n or use custom
	const displayText = variant === 'ads' && !children ? adText || $t('common.banner.ad') : '';

	onMount(() => {
		if (!browser) return;

		// Check sessionStorage only if banner can be closed
		if (canClose) {
			const sessionClosed = sessionStorage.getItem('banner_closed');

			if (sessionClosed === 'true') {
				// Banner was closed in this session, keep it hidden
				bannerVisible = false;
				shouldShowBanner = false;
				return;
			}
		}

		// Show banner (either not closeable or not closed yet)
		shouldShowBanner = true;
		bannerVisible = true;

		let typewriterInterval: ReturnType<typeof setInterval> | null = null;
		let colorInterval: ReturnType<typeof setInterval> | null = null;

		// Start typewriter effect if needed
		if (useTypewriter && displayText) {
			function typeMessage() {
				if (currentCharIndex < displayText.length) {
					bannerText = displayText.substring(0, currentCharIndex + 1);
					currentCharIndex++;

					// Check if text is too long after each character
					if (textElement && currentCharIndex % 10 === 0) {
						checkTextOverflow();
					}
				} else {
					// Finished typing, final check
					checkTextOverflow();
				}
			}

			// Start typing
			typewriterInterval = setInterval(typeMessage, 80);
		} else if (displayText) {
			// Show full text immediately if no typewriter
			bannerText = displayText;
			setTimeout(checkTextOverflow, 100);
		}

		function checkTextOverflow() {
			if (textElement) {
				const containerWidth = textElement.parentElement?.parentElement?.offsetWidth || 0;
				const textWidth = textElement.scrollWidth;
				// If text is longer than 70% of container, enable marquee
				isTextTooLong = textWidth > containerWidth * 0.7;
			}
		}

		// Rainbow color animation (if enabled for ads)
		if (variant === 'ads' && rainbowText) {
			colorInterval = setInterval(() => {
				colorHue = (colorHue + 1) % 360;
			}, 50);
		}

		return () => {
			if (typewriterInterval) clearInterval(typewriterInterval);
			if (colorInterval) clearInterval(colorInterval);
		};
	});

	function closeBanner() {
		if (!canClose) return; // Safety check - shouldn't happen

		bannerVisible = false;
		shouldShowBanner = false;
		// Save to sessionStorage - banner won't show until session ends
		sessionStorage.setItem('banner_closed', 'true');
	}
</script>

{#if browser && shouldShowBanner && bannerVisible}
	<!-- Universal banner - Pushes content down -->
	<div class="banner-container">
		<div class="banner" style="background: {gradient}">
			<div class="mx-auto max-w-4xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 lg:px-8">
				<div class="relative flex items-center justify-center gap-2 sm:gap-3">
					<!-- Pulsing icon (absolute left) -->
					<div class="pulse-icon absolute left-0 z-10 flex-shrink-0">
						{icon}
					</div>

					<!-- Content area (centered with padding for icon and button) -->
					<div
						class="banner-content-container-centered"
						style="padding-left: 50px; padding-right: {canClose ? '40px' : '10px'};"
					>
						{#if children}
							<!-- Custom content via children (works for both ads and info) -->
							<div
								class="banner-custom-content"
								style={variant === 'ads' && rainbowText ? `color: hsl(${colorHue}, 70%, 50%)` : ''}
							>
								{@render children?.()}
							</div>
						{:else if variant === 'ads'}
							<!-- Typewriter text for ads -->
							<div class="banner-text-wrapper-centered">
								<div class="text-scroll-container" class:scrolling={isTextTooLong}>
									<span
										bind:this={textElement}
										class="banner-text"
										class:marquee={isTextTooLong}
										style={rainbowText ? `color: hsl(${colorHue}, 70%, 50%)` : ''}
									>
										{@html bannerText}
									</span>
									{#if isTextTooLong}
										<!-- Duplicate for seamless scroll -->
										<span
											class="banner-text marquee-duplicate"
											style={rainbowText ? `color: hsl(${colorHue}, 70%, 50%)` : ''}
										>
											{@html bannerText}
										</span>
									{/if}
								</div>
							</div>
						{:else}
							<!-- Info variant without children - show placeholder -->
							<div class="banner-info-content">
								<span>ℹ️ Info banner</span>
							</div>
						{/if}
					</div>

					<!-- Close button (absolute right) - only for non-paid ads -->
					{#if canClose}
						<button
							onclick={closeBanner}
							class="close-btn absolute right-0 z-10 flex-shrink-0"
							aria-label="Close banner"
						>
							✕
						</button>
					{/if}
				</div>
			</div>

			<!-- Animated background -->
			<div class="animated-bg"></div>
		</div>
	</div>
{/if}

<style>
	/* Banner container - Sticky at top, pushes content down initially */
	.banner-container {
		position: sticky;
		top: 0;
		z-index: 9999;
		overflow: hidden;
		animation: slideDown 0.6s ease-out;
	}

	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.banner {
		position: relative;
		color: white;
		overflow: hidden;
	}

	/* Animated background */
	.animated-bg {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		animation: shimmer 3s infinite;
	}

	@keyframes shimmer {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}

	/* Pulsing icon */
	.pulse-icon {
		font-size: 1.5rem;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.2);
			opacity: 0.8;
		}
	}

	/* Content container - centered */
	.banner-content-container-centered {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 0;
		overflow: hidden;
		position: relative;
	}

	.banner-text-wrapper-centered {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		flex: 1;
		min-width: 0;
		overflow: hidden;
	}

	/* Text scroll container for long text */
	.text-scroll-container {
		overflow: hidden;
		max-width: 100%;
		position: relative;
		width: 100%;
		white-space: nowrap;
	}

	.text-scroll-container.scrolling {
		display: flex;
		align-items: center;
		animation: marquee-scroll 20s linear infinite;
		width: max-content;
	}

	@keyframes marquee-scroll {
		0% {
			transform: translateX(0%);
		}
		100% {
			transform: translateX(-50%);
		}
	}

	/* Pause marquee on hover */
	.text-scroll-container.scrolling:hover {
		animation-play-state: paused;
	}

	.banner-text.marquee {
		white-space: nowrap;
		display: inline-block;
		padding-right: 120px;
		will-change: transform;
	}

	.banner-text.marquee-duplicate {
		white-space: nowrap;
		display: inline-block;
		padding-right: 120px;
		will-change: transform;
	}

	/* Animated text for ads */
	.banner-text {
		font-weight: 800;
		font-size: clamp(1rem, 2.8vw, 1.375rem);
		letter-spacing: 0.6px;
		line-height: 1.3;
		text-align: center;
		text-shadow:
			0 2px 8px rgba(0, 0, 0, 0.3),
			0 4px 16px rgba(0, 0, 0, 0.2),
			0 0 25px rgba(255, 255, 255, 0.4);
		transition: all 0.3s ease;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.85),
			rgba(255, 255, 255, 1),
			rgba(255, 255, 255, 0.85)
		);
		background-size: 200% auto;
		-webkit-background-clip: text;
		background-clip: text;
		animation:
			shine 2s linear infinite,
			textFloat 3s ease-in-out infinite;
	}

	/* Normal text (not marquee) */
	.banner-text:not(.marquee) {
		word-wrap: break-word;
		overflow-wrap: break-word;
		display: inline-block;
		max-width: 100%;
	}

	/* Hide overflow for all banner content */
	.banner-content-container-centered {
		overflow: hidden;
	}

	/* Custom content styling (for children) */
	.banner-custom-content {
		color: white;
		font-size: clamp(1rem, 2.8vw, 1.3rem);
		font-weight: 700;
		line-height: 1.3;
		text-align: center;
		text-shadow:
			0 2px 8px rgba(0, 0, 0, 0.3),
			0 0 20px rgba(255, 255, 255, 0.3);
	}

	.banner-custom-content :global(strong) {
		font-weight: 700;
	}

	.banner-custom-content :global(a) {
		color: white;
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 2px;
		transition: opacity 0.3s ease;
	}

	.banner-custom-content :global(a:hover) {
		opacity: 0.8;
	}

	/* Info content styling (fallback) */
	.banner-info-content {
		color: white;
		font-size: clamp(0.875rem, 2vw, 1rem);
		line-height: 1.4;
	}

	.banner-info-content :global(strong) {
		font-weight: 700;
	}

	.banner-info-content :global(a) {
		color: white;
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 2px;
		transition: opacity 0.3s ease;
	}

	.banner-info-content :global(a:hover) {
		opacity: 0.8;
	}

	/* Styles for HTML inside text */
	.banner-text :global(strong) {
		font-weight: 800;
	}

	.banner-text :global(a) {
		color: white;
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 3px;
		transition: all 0.3s ease;
	}

	.banner-text :global(a:hover) {
		text-decoration-thickness: 3px;
		opacity: 0.9;
	}

	@keyframes shine {
		0% {
			background-position: 0% center;
		}
		100% {
			background-position: 200% center;
		}
	}

	@keyframes textFloat {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-2px);
		}
	}

	/* Close button */
	.close-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		color: white;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 1.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: rotate(90deg) scale(1.1);
	}

	/* Responsive breakpoints */

	@media (max-width: 480px) {
		.banner {
			font-size: 14px;
		}

		.banner-content-container-centered {
			padding-left: 38px !important;
			padding-right: 32px !important;
		}

		.banner-content-container-centered::before,
		.banner-content-container-centered::after {
			width: 25px;
		}

		.banner-text,
		.banner-info-content {
			font-size: 0.8125rem;
			letter-spacing: 0.2px;
			line-height: 1.3;
		}

		.pulse-icon {
			font-size: 1.125rem;
		}

		.banner-text-wrapper-centered {
			gap: 2px;
		}

		.close-btn {
			width: 24px;
			height: 24px;
			font-size: 1rem;
		}
	}

	@media (min-width: 481px) and (max-width: 640px) {
		.banner-text,
		.banner-info-content {
			font-size: 0.875rem;
			letter-spacing: 0.25px;
		}

		.pulse-icon {
			font-size: 1.25rem;
		}
	}

	@media (min-width: 641px) and (max-width: 768px) {
		.banner-text,
		.banner-info-content {
			font-size: 0.9375rem;
			letter-spacing: 0.3px;
		}
	}

	@media (min-width: 769px) and (max-width: 1024px) {
		.banner-text {
			font-size: 1rem;
		}
	}

	@media (min-width: 1025px) {
		.banner-text {
			font-size: 1.125rem;
		}
	}

	@media (max-width: 320px) {
		.banner-content-container-centered {
			padding-left: 35px !important;
			padding-right: 28px !important;
		}

		.banner-content-container-centered::before,
		.banner-content-container-centered::after {
			width: 20px;
		}

		.banner-text,
		.banner-info-content {
			font-size: 0.75rem;
			letter-spacing: 0.1px;
		}

		.pulse-icon {
			font-size: 1rem;
		}

		.banner-text-wrapper-centered {
			gap: 1px;
		}
	}

	@media (max-width: 640px) {
		.banner > div {
			padding-top: 0.625rem;
			padding-bottom: 0.625rem;
		}
	}
</style>
