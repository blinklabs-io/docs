# Blink Labs documentation

Documentation for Blink Labs open-source Cardano infrastructure, APIs, and
developer tools. The production site is available at
[docs.blinklabs.io](https://docs.blinklabs.io).

## Local development

Requirements:

- Node.js `^20.19.0` or `>=22.12.0`
- npm

Install dependencies and start the Astro development server:

```sh
npm ci
npm run dev
```

The site is available at `http://localhost:4321`.

## Validate a change

Create the production build before opening a pull request:

```sh
npm run build
```

The build generates the static site, Pagefind search index, sitemap, and
LLM-friendly text files in `dist/`.

## Content structure

- `src/content/docs/` contains English documentation.
- `src/content/docs/ja/` contains Japanese translations.
- `src/content/docs/es/` contains Spanish translations.
- `public/` contains screenshots and other static assets.
- `astro.config.mjs` defines Starlight, locales, and sidebar navigation.

Add product documentation under `src/content/docs/guides/<product>/`. Keep
translated filenames aligned with their English counterparts so Starlight can
generate correct language alternatives.

## Contributing

Use focused pull requests and include:

- A concise explanation of the user-facing change.
- Updated translations when the same content exists in Japanese or Spanish.
- A successful `npm run build`.

Report documentation issues or propose improvements in the
[Blink Labs docs repository](https://github.com/blinklabs-io/docs/issues).
