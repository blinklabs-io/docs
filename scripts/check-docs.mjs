import fs from 'node:fs';
import path from 'node:path';
import { slug } from 'github-slugger';

const root = process.cwd();
const docsRoot = path.join(root, 'src/content/docs');
const publicRoot = path.join(root, 'public');
const errors = [];
let contentLookup;

function walk(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const item = path.join(directory, entry.name);
		return entry.isDirectory() ? walk(item) : [item];
	});
}

function existingContentPath(basePath) {
	return contentLookup.has(path.normalize(basePath.replace(/[\\/]+$/, '')));
}

function contentRoutePath(file) {
	const route = path.relative(docsRoot, file)
		.slice(0, -path.extname(file).length)
		.split(path.sep)
		.map((segment) => slug(segment))
		.join('/')
		.replace(/(?:^|\/)index$/, '');
	return path.join(docsRoot, route);
}

function checkFrontmatter(file, source) {
	const frontmatter = source.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatter) {
		errors.push(`${file}: missing YAML frontmatter`);
		return;
	}

	for (const field of ['title', 'description']) {
		if (!new RegExp(`^${field}:\\s*\\S`, 'm').test(frontmatter[1])) {
			errors.push(`${file}: missing non-empty ${field}`);
		}
	}

	const relativePath = path.relative(docsRoot, file).split(path.sep).join('/');
	if (/(?:^|\/)guides\/[^/]+\/releases\/v[^/]+\.mdx?$/i.test(relativePath)) {
		const sidebar = frontmatter[1].match(
			/^sidebar:\s*\n((?:[ \t]+.*(?:\n|$))*)/m,
		);
		if (!sidebar || !/^[ \t]+hidden:\s*true\s*$/m.test(sidebar[1])) {
			errors.push(`${file}: release detail must be hidden from the sidebar`);
		}
	}
}

function checkLink(file, href) {
	if (
		!href ||
		href.startsWith('#') ||
		/^(?:https?:|mailto:|tel:|data:)/.test(href) ||
		href.includes('{')
	) {
		return;
	}

	const cleanHref = decodeURIComponent(href.split(/[?#]/, 1)[0]);
	if (!cleanHref) return;

	if (cleanHref.startsWith('/')) {
		const publicPath = path.join(publicRoot, cleanHref);
		const contentPath = path.join(docsRoot, cleanHref);
		if (!fs.existsSync(publicPath) && !existingContentPath(contentPath)) {
			errors.push(`${file}: broken internal link ${href}`);
		}
		return;
	}

	const routeDirectory = contentRoutePath(file);
	const target = path.resolve(routeDirectory, cleanHref);
	if (!existingContentPath(target)) {
		errors.push(`${file}: broken relative link ${href}`);
	}
}

const files = walk(docsRoot).filter((file) => /\.(?:md|mdx)$/.test(file));
contentLookup = new Set(files.map(contentRoutePath));

for (const file of files) {
	const source = fs.readFileSync(file, 'utf8');
	checkFrontmatter(file, source);

	for (const match of source.matchAll(/(?<!!)\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
		checkLink(file, match[1]);
	}
	for (const match of source.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
		checkLink(file, match[1]);
	}
	for (const match of source.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)) {
		checkLink(file, match[1]);
	}
}

if (errors.length > 0) {
	console.error(`Documentation checks failed with ${errors.length} error(s):`);
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log(`Documentation checks passed for ${files.length} files.`);
