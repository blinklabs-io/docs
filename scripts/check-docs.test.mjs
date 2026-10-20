import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const checker = fileURLToPath(new URL('./check-docs.mjs', import.meta.url));

function checkFixture(t, href, source = 'home.md') {
	const root = mkdtempSync(path.join(tmpdir(), 'docs-links-test-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	const docs = path.join(root, 'src/content/docs');
	const target = path.join(docs, 'guides/demo/SPO Guides/target.md');
	const page = path.join(docs, source);
	for (const directory of [path.dirname(target), path.dirname(page), path.join(root, 'public')]) {
		mkdirSync(directory, { recursive: true });
	}
	const frontmatter = '---\ntitle: Example\ndescription: Example page.\n---\n\n';
	writeFileSync(target, frontmatter);
	writeFileSync(page, `${frontmatter}[Target](${href})\n`);
	writeFileSync(path.join(root, 'public', 'asset.txt'), 'asset');
	return spawnSync(process.execPath, [checker], { cwd: root, encoding: 'utf8' });
}

test('accepts generated slugs for source directories containing spaces', (t) => {
	const result = checkFixture(t, '/guides/demo/spo-guides/target/');
	assert.equal(result.status, 0, result.stderr);
});

test('rejects source directory URLs that do not exist on the site', (t) => {
	const result = checkFixture(t, '/guides/demo/SPO%20Guides/target/');
	assert.equal(result.status, 1, result.stdout);
	assert.match(result.stderr, /broken internal link/);
});

test('resolves relative links from the generated source route', (t) => {
	const result = checkFixture(t, '../../spo-guides/target/', 'guides/demo/Developer Guides/start.md');
	assert.equal(result.status, 0, result.stderr);
});

test('retains public asset and missing route validation', (t) => {
	assert.equal(checkFixture(t, '/asset.txt').status, 0);
	const missing = checkFixture(t, '/guides/demo/missing/');
	assert.equal(missing.status, 1, missing.stdout);
	assert.match(missing.stderr, /broken internal link/);
});
