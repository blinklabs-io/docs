
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://blinklabs.io',
	integrations: [
		starlight({
			customCss: [
				'./src/styles/main.css',
				'./src/styles/custom.css',
			],
			title: 'Blink Labs',
			logo: {
				src: './src/assets/transparent-no-buffer.png',
				replacesTitle: true,
			},
			social: {
				github: 'https://github.com/blinklabs-io',
			},
			sidebar: [
				{
					label: 'Documentation',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'g0uroboros', slug: 'guides/g0uroboros' },
						{ label: 'Adder', autogenerate: { directory: 'guides/adder' } },
						{ label: 'Dingo', slug: 'guides/dingo' },
						{ label: 'nview', autogenerate: { directory: 'guides/nview' } },
						{ label: 'Tx Submit API', slug: 'guides/txsubmitapi' },
						{ label: 'Bluefin', slug: 'guides/bluefin' },
						{ label: 'Bursa', slug: 'guides/bursa' },
						{ label: 'Cardano Node API', slug: 'guides/cardano-node-api' },
						{ label: 'TxTop', autogenerate: { directory: 'guides/txtop' } },
						{ label: 'Tx Submit API Mirror', slug: 'guides/txsubmitapi-mirror' },
						{ label: 'cDNSd', slug: 'guides/cdnsd' },
						{ label: 'Docker Images', slug: 'guides/docker-images' },

					],
				},
				{
					label: 'Examples',
					autogenerate: { directory: 'examples' },
				},
			],
		}),
	],
});
