// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.blinklabs.io',
	redirects: {
		'/': '/home',
	},
	integrations: [
		starlight({
			favicon: 'favicon.ico',
			customCss: [
				'./src/styles/main.css',
				'./src/styles/custom.css',
			],
			title: 'Blink Labs',
			logo: {
				src: './src/assets/blinklabs-white.svg',
				replacesTitle: true,
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/blinklabs-io/docs' },
			],
			sidebar: [
				{
					label: 'Documentation',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Home', slug: 'home' },
						{ label: 'Adder', autogenerate: { directory: 'guides/adder' } },
						{ label: 'nview', autogenerate: { directory: 'guides/nview' } },
						{ label: 'Dingo', autogenerate: { directory: 'guides/dingo' } },
						{ label: 'TxTop', autogenerate: { directory: 'guides/txtop' } },
						{ label: 'cardano-up', autogenerate: { directory: 'guides/cardano-up' } },
						{ label: 'Bluefin', autogenerate: { directory: 'guides/bluefin' } },
						{ label: 'Bursa', autogenerate: { directory: 'guides/bursa' } },
						{ label: 'Tx Submit API', autogenerate: { directory: 'guides/txsubmit' } },
						{ label: 'Cardano Node API', autogenerate: { directory: 'guides/cardano-node-api' } },
						{ label: 'Tx Submit API Mirror', autogenerate: { directory: 'guides/txsubmit-api-mirror' } },
						{ label: 'cDNSd', slug: 'guides/cdnsd' },
						{ label: 'gOuroboros', slug: 'guides/gouroboros' },
						{ label: 'Docker Images', slug: 'guides/docker-images' },
					],
				},
			],
		}),
	],
});
