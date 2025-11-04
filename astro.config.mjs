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
						{ label: 'Adder', collapsed: true, autogenerate: { directory: 'guides/adder' } },
						{ label: 'nview', collapsed: true, autogenerate: { directory: 'guides/nview' } },
						{ label: 'Dingo', collapsed: true, autogenerate: { directory: 'guides/dingo' } },
						{ label: 'TxTop', collapsed: true, autogenerate: { directory: 'guides/txtop' } },
						{ label: 'cardano-up', collapsed: true, autogenerate: { directory: 'guides/cardano-up' } },
						{ label: 'Bluefin', collapsed: true, autogenerate: { directory: 'guides/bluefin' } },
						{ label: 'Bursa', collapsed: true, autogenerate: { directory: 'guides/bursa' } },
						{ label: 'Tx Submit API', collapsed: true, autogenerate: { directory: 'guides/txsubmit' } },
						{ label: 'Cardano Node API', collapsed: true, autogenerate: { directory: 'guides/cardano-node-api' } },
						{ label: 'Tx Submit API Mirror', collapsed: true, autogenerate: { directory: 'guides/txsubmit-api-mirror' } },
						{ label: 'cDNSd', collapsed: true, slug: 'guides/cdnsd' },
						{ label: 'gOuroboros', collapsed: true, autogenerate: { directory: 'guides/gouroboros' } },
						{ label: 'Docker Images', collapsed: true, slug: 'guides/docker-images' },
					],
				},
			],
		}),
	],
});
