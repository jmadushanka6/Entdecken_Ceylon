import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { STATIC_PAGE_PATHS } from './app.routes';
import { BUILT_IN_PAGES } from './built-in-pages';
import { HomePageComponent } from './home-page.component';
import { SeoService } from './seo.service';
import { SiteFooterComponent } from './site-footer.component';
import { SiteHeaderComponent } from './site-header.component';

/**
 * Regressionstest: Jeder interne Link muss auf eine existierende Seite führen.
 * Vorher landeten Besucher bei fast jedem Klick auf „Seite nicht gefunden“.
 */
const KNOWN_PATHS = new Set<string>([...STATIC_PAGE_PATHS, ...BUILT_IN_PAGES.map((page) => page.uri)]);

const normalize = (href: string): string => href.replace(/^\//, '').replace(/[?#].*$/, '').replace(/\/$/, '');

const expectResolvable = (hrefs: string[], context: string): void => {
  expect(hrefs.length).withContext(`${context}: keine Links gefunden`).toBeGreaterThan(0);
  hrefs.forEach((href) => {
    expect(KNOWN_PATHS.has(normalize(href))).withContext(`${context} → ${href}`).toBeTrue();
  });
};

describe('Interne Links', () => {
  it('führen auf der Startseite nur zu existierenden Seiten', () => {
    const home = new HomePageComponent({ update: () => undefined } as unknown as SeoService);

    expectResolvable(home.planningSteps.map((step) => step.href), 'Planungsschritte');
    expectResolvable(home.guideCards.map((card) => card.href), 'Guide-Karten');
    expectResolvable(home.moodTiles.map((tile) => tile.href), 'Regionen-Kacheln');
    expectResolvable(home.travelNotices.map((notice) => notice.href), 'Aktuelle Hinweise');
    expectResolvable(
      home.quickFacts.flatMap((fact) => (fact.href ? [fact.href] : [])),
      'Kurzfakten'
    );
    expectResolvable(
      home.faqs.flatMap((faq) => (faq.link ? [faq.link.href] : [])),
      'FAQ'
    );
  });

  it('führen in Hauptnavigation und Footer nur zu existierenden Seiten', () => {
    const header = new SiteHeaderComponent({ events: EMPTY } as unknown as Router);
    const footer = new SiteFooterComponent();

    expectResolvable(header.navItems.map((item) => item.path), 'Hauptnavigation');
    expectResolvable(
      [...footer.planningLinks, ...footer.discoverLinks].map((link) => link.path),
      'Footer'
    );
  });

  it('führen in den Ratgeberseiten nur zu existierenden Seiten', () => {
    BUILT_IN_PAGES.forEach((page) => {
      const hrefs = [...(page.bodyHtml ?? '').matchAll(/href="(\/[^"]*)"/g)].map((match) => match[1]);

      hrefs.forEach((href) => {
        expect(KNOWN_PATHS.has(normalize(href))).withContext(`/${page.uri} → ${href}`).toBeTrue();
      });
    });
  });
});

describe('Starterseiten', () => {
  it('haben eindeutige URIs', () => {
    const uris = BUILT_IN_PAGES.map((page) => page.uri);
    expect(new Set(uris).size).toBe(uris.length);
  });

  it('haben Titel, Beschreibung, lokales Titelbild und ein gültiges Prüfdatum', () => {
    BUILT_IN_PAGES.forEach((page) => {
      expect(page.title.trim()).withContext(page.uri).not.toBe('');
      expect(page.description.length).withContext(page.uri).toBeGreaterThan(50);
      expect(page.heroImageUrl).withContext(page.uri).toMatch(/^\/assets\/images\/[a-z0-9-]+\.svg$/);
      expect(page.lastReviewed ?? '').withContext(page.uri).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(page.lastReviewed ?? ''))).withContext(page.uri).toBeFalse();
    });
  });

  it('öffnen externe Links sicher in einem neuen Tab', () => {
    BUILT_IN_PAGES.forEach((page) => {
      const externalAnchors = (page.bodyHtml ?? '').match(/<a href="https?:\/\/[^>]*>/g) ?? [];

      externalAnchors.forEach((anchor) => {
        expect(anchor).withContext(page.uri).toContain('target="_blank"');
        expect(anchor).withContext(page.uri).toContain('rel="noopener noreferrer"');
      });
    });
  });
});
