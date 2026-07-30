// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import optimizeDocImages from './src/plugins/optimize-doc-images.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.blinklabs.io',
	redirects: {
		'/': '/home',
	},
	markdown: {
		rehypePlugins: [optimizeDocImages],
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
						media: 'print',
						onload: "this.media='all'",
					},
				},
				{
					tag: 'noscript',
					content: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&amp;family=JetBrains+Mono:wght@400;500;600&amp;display=swap">',
				},
			],
			title: 'Blink Labs',
			description: 'Guides and reference documentation for Blink Labs Cardano nodes, APIs, developer libraries, monitoring, and automation tools.',
			editLink: {
				baseUrl: 'https://github.com/blinklabs-io/docs/edit/main/',
			},
			lastUpdated: true,
			plugins: [
				starlightLlmsTxt({
					projectName: 'Blink Labs Cardano Documentation',
					description: 'Official documentation for Blink Labs open-source Cardano infrastructure and developer tooling, including Dingo, Adder, cardano-up, gOuroboros, APIs, monitoring, and automation.',
					details: `Use the abridged documentation for general questions and the product-specific sets for focused retrieval.

- Commands and configuration are product- and version-specific; do not mix instructions between products.
- Prefer quick-start and reference pages for current usage. Release notes describe historical changes.
- English is the canonical source used for these generated LLM documents. Japanese and Spanish translations are available on the documentation website.`,
					customSets: [
						{
							label: 'Quick starts',
							description: 'Entry points and setup guides across Blink Labs products',
							paths: [
								'home',
								'guides/*/001-*',
								'guides/*/002-*',
								'guides/cdnsd',
								'guides/docker-images',
							],
						},
						{
							label: 'Cardano nodes and operations',
							description: 'Dingo, cardano-up, cDNSd, and container operations',
							paths: [
								'guides/dingo/**',
								'guides/cardano-up/**',
								'guides/cdnsd',
								'guides/docker-images',
							],
						},
						{
							label: 'APIs and transaction submission',
							description: 'Cardano Node API, Tx Submit, Tx Submit Mirror, and Bursa',
							paths: [
								'guides/cardano-node-api/**',
								'guides/txsubmit/**',
								'guides/txsubmit-api-mirror/**',
								'guides/bursa/**',
							],
						},
						{
							label: 'Monitoring and automation',
							description: 'Adder, nview, TxTop, and Bluefin guides',
							paths: [
								'guides/adder/**',
								'guides/nview/**',
								'guides/txtop/**',
								'guides/bluefin/**',
							],
						},
						{
							label: 'Developer libraries',
							description: 'gOuroboros and plutigo library documentation',
							paths: [
								'guides/gouroboros/**',
								'guides/plutigo/**',
							],
						},
					],
					optionalLinks: [
						{
							label: 'Documentation source',
							url: 'https://github.com/blinklabs-io/docs',
							description: 'Source repository and issue tracker for this documentation',
						},
						{
							label: 'Blink Labs projects',
							url: 'https://blinklabs.io/projects-open-source',
							description: 'Project overview and downloads',
						},
						{
							label: 'Blink Labs on GitHub',
							url: 'https://github.com/blinklabs-io',
							description: 'Canonical source repositories for Blink Labs software',
						},
					],
					promote: [
						'home',
						'guides/*/001-*',
						'guides/*/002-*',
					],
					demote: ['guides/**/releases/**'],
					exclude: ['guides/**/releases/**'],
					pageSeparator: '\n\n---\n\n',
					minify: {
						note: false,
						tip: false,
						caution: false,
						danger: false,
						details: true,
						whitespace: true,
						collapseCodeBlocks: false,
					},
					customSelectors: {
						all: ['.sl-anchor-link'],
					},
				}),
			],
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
					label: 'Start here',
					items: [
						{ label: 'Home', slug: 'home' },
					],
				},
				{
					label: 'Nodes and operations',
					items: [
						{ label: 'Dingo', collapsed: true, items: [{ autogenerate: { directory: 'guides/dingo' } }] },
						{ label: 'cardano-up', collapsed: true, items: [{ autogenerate: { directory: 'guides/cardano-up' } }] },
						{ label: 'nview', collapsed: true, items: [{ autogenerate: { directory: 'guides/nview' } }] },
						{ label: 'TxTop', collapsed: true, items: [{ autogenerate: { directory: 'guides/txtop' } }] },
					],
				},
				{
					label: 'Automation',
					items: [
						{ label: 'Adder', collapsed: true, items: [{ autogenerate: { directory: 'guides/adder' } }] },
						{ label: 'Bluefin', collapsed: true, items: [{ autogenerate: { directory: 'guides/bluefin' } }] },
					],
				},
				{
					label: 'APIs and services',
					items: [
						{ label: 'Tx Submit API', collapsed: true, items: [{ autogenerate: { directory: 'guides/txsubmit' } }] },
						{ label: 'Cardano Node API', collapsed: true, items: [{ autogenerate: { directory: 'guides/cardano-node-api' } }] },
						{ label: 'Tx Submit API Mirror', collapsed: true, items: [{ autogenerate: { directory: 'guides/txsubmit-api-mirror' } }] },
						{ label: 'cDNSd', collapsed: true, items: [{ autogenerate: { directory: 'guides/cdnsd' } }] },
						{ label: 'Docker Images', collapsed: true, slug: 'guides/docker-images' },
					],
				},
				{
					label: 'Developer libraries',
					items: [
						{ label: 'Bursa', collapsed: true, items: [{ autogenerate: { directory: 'guides/bursa' } }] },
						{ label: 'gOuroboros', collapsed: true, items: [{ autogenerate: { directory: 'guides/gouroboros' } }] },
						{ label: 'plutigo', collapsed: true, items: [{ autogenerate: { directory: 'guides/plutigo' } }] },
					],
				},
			],
		}),
	],
});
