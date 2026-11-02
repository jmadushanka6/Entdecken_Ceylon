# Entdecken Ceylon

German-language travel guide for Sri Lanka, written for travellers from Germany, Austria and Switzerland.
Angular 17 (standalone components), content from built-in starter pages and an optional Firestore-backed CMS.

## Quick start

```bash
npm install
npm start              # dev server on http://localhost:4200
npm run build          # production build → dist/entdecken-ceylon/browser
npm test               # unit tests in Chrome (watch mode)
npm run test:ci        # unit tests once, headless (used in CI)
npm run sitemap        # regenerate src/sitemap.xml after adding/removing guide pages
```

## Where things live

| What | Where |
| --- | --- |
| Guide pages shipped with the site (Reisezeit, Visum, Routen, Regionen, …) | `src/app/built-in-pages.ts` |
| Time-sensitive info (railway status after Cyclone Ditwah) | `src/app/travel-status.ts` |
| Homepage sections, FAQ, “Aktuelle Hinweise” | `src/app/home-page.component.ts` |
| Operator details for Impressum, Datenschutz, Kontakt | `src/app/site-operator.config.ts` |
| Links to official sources (Auswärtiges Amt, BMEIA, EDA, ETA portal) | `src/app/official-sources.ts` |
| Firebase project settings | `src/app/firebase.config.ts` |
| Firestore security rules / Firebase Hosting | `firestore.rules`, `firebase.json` |
| Global styles, design tokens, guide-page typography | `src/styles.scss`, `src/styles/_prose.scss` |

## Content model

- **Built-in starter pages** make every link on the site work out of the box. They are lazy-loaded as a separate chunk.
- **CMS pages** are created in `/admin` and stored in Firestore. A CMS page with the same URI as a starter page replaces
  it; the admin lists all starter pages and can load one into the form (“Customize”).
- **`lastReviewed`** (YYYY-MM-DD) is shown to visitors as “Stand: November 2026 · Angaben ohne Gewähr”. Update it whenever
  a page has been re-checked.
- Page HTML is rendered as trusted HTML. Only signed-in admins can write it (enforced by `firestore.rules`).

## Firebase setup

Until this is done, pages created in `/admin` are stored only in the browser you used (development builds) and editing is
disabled in production builds.

1. **Firestore** – create a Firestore database. The code expects the database ID `x` and the collection `y`
   (`FIRESTORE_DATABASE_ID` / `FIRESTORE_COLLECTION` in `src/app/content.service.ts`). If yours differ, change them there,
   the `match /y/{pageId}` line in `firestore.rules` and `"database"` in `firebase.json`.
2. **Web app config** – copy the config from Firebase Console → Project settings → Your apps into
   `src/app/firebase.config.ts`.
3. **Admin account** – Firebase Console → Authentication → Sign-in method → enable *Email/Password*. Under *Users*, add
   your admin account and copy its **UID**.
4. **Security rules** – put the UID into `isAdmin()` in `firestore.rules` (replace `REPLACE_WITH_ADMIN_UID`), then deploy:
   ```bash
   npx firebase-tools login
   npx firebase-tools use --add          # select your project (creates .firebaserc)
   npx firebase-tools deploy --only firestore
   ```
   Other people may still create accounts with the public API key, but the rules only let the listed UIDs write.
5. **Hosting** – `npm run build && npx firebase-tools deploy --only hosting`. `firebase.json` rewrites all paths to
   `index.html`. On any other host, configure the same rewrite, otherwise direct links such as `/routen/14-tage` return 404.
6. Once Firebase is configured, the privacy policy automatically shows its section about Google Cloud Firestore.

## Before going live – needs the site owner

- [ ] Real operator details in `src/app/site-operator.config.ts` (the Impressum currently shows the placeholder
      “Musterstraße 12”). Required by § 5 DDG.
- [ ] Hosting provider section in the privacy policy (TODO in `src/app/privacy-policy.component.html`), then have
      Impressum and Datenschutz reviewed by a lawyer or a generator such as e-recht24.
- [ ] Firebase setup (above), including your admin UID in `firestore.rules`.
- [ ] Fact-check the guide pages (prices, seasons, entry rules) and update `lastReviewed`.
- [ ] Own or licensed photos instead of the illustrations (with alt text – there is a field in `/admin`).
- [ ] Decide on the cookie banner: it offers consent for analytics, but no analytics are installed. Either add
      privacy-friendly analytics (and update the privacy policy) or simplify the banner.

## Keeping content current

- **Railway status** – when the hill-country line north of Nanu Oya reopens (expected end of 2026), update
  `src/app/travel-status.ts` and the “Aktuelle Hinweise” list in `src/app/home-page.component.ts`.
- **Entry rules** – the ETA has been free for DE/AT/CH since 25 May 2026; re-check the official sources linked on the
  visa page before each season.
- **Sitemap** – after adding or removing starter pages run `npm run sitemap` (CI fails if `src/sitemap.xml` is stale).
  CMS-only pages can be listed in `EXTRA_PATHS` in `scripts/generate-sitemap.mjs`.

## Tests

`npm run test:ci` covers, among other things:

- every internal link on the homepage, in the header/footer and inside the guide pages leads to an existing page,
- starter pages have unique URIs, metadata, a valid review date and safe external links,
- CMS pages override starter pages,
- admin sign-in, token refresh and that Firestore writes carry the admin's ID token (and are refused without it).

GitHub Actions (`.github/workflows/ci.yml`) runs the sitemap check, the production build and the tests on every push to
`main` and on pull requests.
