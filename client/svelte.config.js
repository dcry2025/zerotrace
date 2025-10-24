import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-node for production deployments with Node.js/Docker
		adapter: adapter({
			out: 'build',
			precompress: false,
			envPrefix: 'VITE_'
		})
	},
  prerender: {
    default: false,
  },
	compilerOptions: {
		customElement: true
	},
  trailingSlash: 'ignore'
};


export default config;
