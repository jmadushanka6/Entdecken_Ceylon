#!/usr/bin/env node
/**
 * Generates src/sitemap.xml from the built-in guide pages and the static routes.
 *
 *   npm run sitemap         write src/sitemap.xml
 *   npm run sitemap:check   fail if src/sitemap.xml is out of date (used in CI)
 *
 * Pages created only in the CMS (Firestore) are not included automatically –
 * add their paths to EXTRA_PATHS below.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://entdecken-ceylon.de';
const SOURCE = resolve(ROOT, 'src/app/built-in-pages.ts');
const TARGET = resolve(ROOT, 'src/sitemap.xml');

/** Static routes, see STATIC_PAGE_PATHS in src/app/app.routes.ts. */
const STATIC_PATHS = ['', 'kontakt', 'impressum', 'datenschutz', 'sitemap'];
/** Additional CMS pages, e.g. 'orte/jaffna'. */
const EXTRA_PATHS = [];

const source = readFileSync(SOURCE, 'utf8');
const defaultReviewed = source.match(/const REVIEWED = '(\d{4}-\d{2}-\d{2})'/)?.[1];
const pages = [...source.matchAll(/uri: '([^']+)'[\s\S]*?lastReviewed: (?:REVIEWED|'(\d{4}-\d{2}-\d{2})')/g)].map(
  (match) => ({ path: match[1], lastmod: match[2] ?? defaultReviewed })
);

const declaredPages = (source.match(/^\s+uri: '/gm) ?? []).length;
if (!pages.length || pages.length !== declaredPages || pages.some((page) => !page.lastmod)) {
  console.error(`Could not read all pages from ${SOURCE} (found ${pages.length} of ${declaredPages}).`);
  process.exit(1);
}

const entries = [
  ...STATIC_PATHS.map((path) => ({ path })),
  ...[...pages, ...EXTRA_PATHS.map((path) => ({ path }))].sort((a, b) => a.path.localeCompare(b.path))
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map(({ path, lastmod }) =>
    `  <url><loc>${SITE_URL}/${path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
  ),
  '</urlset>',
  ''
].join('\n');

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = readFileSync(TARGET, 'utf8');
  } catch {
    // missing file is reported below
  }
  if (current !== xml) {
    console.error('src/sitemap.xml is out of date. Run "npm run sitemap" and commit the result.');
    process.exit(1);
  }
  console.log(`src/sitemap.xml is up to date (${entries.length} URLs).`);
} else {
  writeFileSync(TARGET, xml);
  console.log(`Wrote src/sitemap.xml (${entries.length} URLs).`);
}
