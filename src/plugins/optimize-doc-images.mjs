/**
 * Add browser-native image loading hints to images rendered from Markdown.
 *
 * The first image on a documentation page is treated as a likely page visual
 * and loaded immediately. Remaining images are deferred until the reader
 * approaches them, which is especially useful for screenshot-heavy guides.
 */
export default function optimizeDocImages() {
	return (tree) => {
		let firstImage = true;

		function visit(node) {
			if (node.type === 'element' && node.tagName === 'img') {
				node.properties ??= {};
				node.properties.decoding ??= 'async';

				if (firstImage) {
					node.properties.fetchPriority ??= 'high';
					firstImage = false;
				} else {
					node.properties.loading ??= 'lazy';
				}
			}

			for (const child of node.children ?? []) visit(child);
		}

		visit(tree);
	};
}
