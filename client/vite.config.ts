import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: true,
		port: 3000,
		allowedHosts: ['zerotrace.work', 'www.zerotrace.work'],
		hmr: {
			protocol: 'wss',
			host: 'zerotrace.work',
			clientPort: 443
		}
	},
	preview: {
		host: true,
		allowedHosts: ['zerotrace.work', 'www.zerotrace.work']
	}
});
