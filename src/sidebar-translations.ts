import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';

const groupLabels: Record<string, Record<string, string>> = {
	es: {
		'Development Guides': 'Guías de desarrollo',
		'Developer Guides': 'Guías para desarrolladores',
		'SPO Guides': 'Guías para operadores de pools',
		Examples: 'Ejemplos',
		Releases: 'Versiones',
		'library-examples': 'Ejemplos de la biblioteca',
	},
	ja: {
		'Development Guides': '開発ガイド',
		'Developer Guides': '開発者ガイド',
		'SPO Guides': 'ステークプール運用ガイド',
		Examples: 'サンプル',
		Releases: 'リリース',
		'library-examples': 'ライブラリサンプル',
	},
};

export const onRequest = defineRouteMiddleware(({ locals }, next) => {
	const route = locals.starlightRoute;
	const labels = route.locale && groupLabels[route.locale];
	if (labels) {
		const translate = (entries: StarlightRouteData['sidebar']): StarlightRouteData['sidebar'] =>
			entries.map((entry) => entry.type === 'group'
				? { ...entry, label: labels[entry.label] ?? entry.label, entries: translate(entry.entries) }
				: entry);
		route.sidebar = translate(route.sidebar);
	}
	return next();
});
