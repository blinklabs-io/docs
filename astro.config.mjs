// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Blink Labs Docs',
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
						{ label: 'nview', slug: 'guides/nview' },
						{ label: 'Tx Submit API', slug: 'guides/txsubmitapi' },
						{ label: 'Bluefin', slug: 'guides/bluefin' },
						{ label: 'Bursa', slug: 'guides/bursa' },
						{ label: 'Cardano Node API', slug: 'guides/cardano-node-api' },
						{ label: 'TxTop', slug: 'guides/txtop' },
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
