// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

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
			head: [
				{
					tag: 'link',
					attrs: {
						rel: 'preconnect',
						href: 'https://fonts.googleapis.com',
					},
				},
				{
					tag: 'link',
					attrs: {
						rel: 'preconnect',
						href: 'https://fonts.gstatic.com',
						crossorigin: true,
					},
				},
				{
					tag: 'link',
					attrs: {
						rel: 'stylesheet',
						href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
					},
				},
			],
			title: 'Blink Labs',
			plugins: [starlightLlmsTxt()],
			logo: {
				src: './src/assets/blinklabs-white.svg',
				replacesTitle: true,
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/blinklabs-io/docs' },
			],
			defaultLocale: 'root',
			locales: {
				root: {
					label: 'English',
					lang: 'en',
				},
				ja: {
					label: '日本語',
					lang: 'ja',
				},
				es: {
					label: 'Español',
					lang: 'es',
				},
			},
			sidebar: [
				{
					label: 'Documentation',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Home', slug: 'home' },
						{ label: 'Adder', collapsed: true, items: [{ autogenerate: { directory: 'guides/adder' } }] },
						{ label: 'nview', collapsed: true, items: [{ autogenerate: { directory: 'guides/nview' } }] },
						{ label: 'Dingo', collapsed: true, items: [{ autogenerate: { directory: 'guides/dingo' } }] },
						{ label: 'TxTop', collapsed: true, items: [{ autogenerate: { directory: 'guides/txtop' } }] },
						{ label: 'cardano-up', collapsed: true, items: [{ autogenerate: { directory: 'guides/cardano-up' } }] },
						{ label: 'Bluefin', collapsed: true, items: [{ autogenerate: { directory: 'guides/bluefin' } }] },
						{ label: 'Bursa', collapsed: true, items: [{ autogenerate: { directory: 'guides/bursa' } }] },
						{ label: 'Tx Submit API', collapsed: true, items: [{ autogenerate: { directory: 'guides/txsubmit' } }] },
						{ label: 'Cardano Node API', collapsed: true, items: [{ autogenerate: { directory: 'guides/cardano-node-api' } }] },
						{ label: 'Tx Submit API Mirror', collapsed: true, items: [{ autogenerate: { directory: 'guides/txsubmit-api-mirror' } }] },
						{ label: 'cDNSd', collapsed: true, slug: 'guides/cdnsd' },
						{ label: 'gOuroboros', collapsed: true, items: [{ autogenerate: { directory: 'guides/gouroboros' } }] },
						{ label: 'plutigo', collapsed: true, items: [{ autogenerate: { directory: 'guides/plutigo' } }] },
						{ label: 'Docker Images', collapsed: true, slug: 'guides/docker-images' },
					],
				},
			],
		}),
	],
});
