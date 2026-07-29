import fs from 'node:fs';
import path from 'node:path';

const distRoot = path.join(process.cwd(), 'dist');
const errors = [];
const customSets = [
	'quick-starts',
	'cardano-nodes-and-operations',
	'apis-and-transaction-submission',
	'monitoring-and-automation',
	'developer-libraries',
];

function readOutput(relativePath) {
	const outputPath = path.join(distRoot, relativePath);
	if (!fs.existsSync(outputPath)) {
		errors.push(`${relativePath}: output was not generated`);
		return '';
	}

	const content = fs.readFileSync(outputPath, 'utf8');
	if (!content.trim()) errors.push(`${relativePath}: output is empty`);
	return content;
}

const index = readOutput('llms.txt');
const small = readOutput('llms-small.txt');
const full = readOutput('llms-full.txt');
const robots = readOutput('robots.txt');
const customOutputs = customSets.map((slug) => ({
	slug,
	content: readOutput(path.join('_llms-txt', `${slug}.txt`)),
}));

for (const expected of [
	'# Blink Labs Cardano Documentation',
	'https://docs.blinklabs.io/llms-small.txt',
	'https://docs.blinklabs.io/llms-full.txt',
	'https://docs.blinklabs.io/_llms-txt/quick-starts.txt',
	'https://docs.blinklabs.io/_llms-txt/cardano-nodes-and-operations.txt',
	'https://docs.blinklabs.io/_llms-txt/apis-and-transaction-submission.txt',
	'https://docs.blinklabs.io/_llms-txt/monitoring-and-automation.txt',
	'https://docs.blinklabs.io/_llms-txt/developer-libraries.txt',
]) {
	if (!index.includes(expected)) errors.push(`llms.txt: missing ${expected}`);
}

if (small.length >= full.length) {
	errors.push('llms-small.txt: abridged output must be smaller than llms-full.txt');
}

for (const [name, content] of [
	['llms-small.txt', small],
	['llms-full.txt', full],
	...customOutputs.map(({ slug, content }) => [`_llms-txt/${slug}.txt`, content]),
]) {
	if (content.length < 500) errors.push(`${name}: output is unexpectedly short`);
	if (content.includes('[Section titled')) {
		errors.push(`${name}: contains redundant generated heading-anchor text`);
	}
	if (/<(?:html|script)\b/i.test(content)) {
		errors.push(`${name}: contains unexpected rendered HTML`);
	}
}

if (!full.includes('\n\n---\n\n')) {
	errors.push('llms-full.txt: missing explicit page separators');
}

if (!robots.includes('Allow: /')) errors.push('robots.txt: site is not explicitly crawlable');
if (!robots.includes('https://docs.blinklabs.io/sitemap-index.xml')) {
	errors.push('robots.txt: sitemap URL is missing');
}

if (errors.length > 0) {
	console.error(`LLM output checks failed with ${errors.length} error(s):`);
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log(
	`LLM output checks passed (${small.length.toLocaleString()} abridged bytes, ${full.length.toLocaleString()} complete bytes, ${customOutputs.length} focused sets).`,
);
