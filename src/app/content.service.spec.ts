import { TestBed } from '@angular/core/testing';
import { filter, firstValueFrom } from 'rxjs';
import { ContentPage, ContentService } from './content.service';

const STORAGE_KEY = 'content-pages';

const cmsPage = (overrides: Partial<ContentPage>): ContentPage => ({
  uri: 'test-seite',
  title: 'Testseite',
  description: 'Beschreibung',
  heroImageUrl: '',
  customCss: '',
  ...overrides
});

async function createService(storedPages: ContentPage[] = []): Promise<ContentService> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, pages: storedPages }));
  TestBed.configureTestingModule({});
  const service = TestBed.inject(ContentService);
  await firstValueFrom(service.pagesLoaded$.pipe(filter((isLoaded) => isLoaded)));
  return service;
}

describe('ContentService', () => {
  let previousValue: string | null;

  beforeEach(() => {
    previousValue = localStorage.getItem(STORAGE_KEY);
  });

  afterEach(() => {
    if (previousValue === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, previousValue);
    }
  });

  it('liefert Starterseiten, wenn keine CMS-Seite existiert', async () => {
    const service = await createService();

    expect(service.getPageByUri('reise-planen/beste-reisezeit')?.title).toBe('Beste Reisezeit für Sri Lanka');
    expect(service.isBuiltInUri('reise-planen/beste-reisezeit')).toBeTrue();
    expect(service.getPages()).toEqual([]);
  });

  it('lässt CMS-Seiten mit gleicher URI die Starterseite ersetzen', async () => {
    const service = await createService([cmsPage({ uri: 'routen/10-tage', title: 'Eigene 10-Tage-Route' })]);

    expect(service.getPageByUri('routen/10-tage')?.title).toBe('Eigene 10-Tage-Route');

    const published = service.getPublishedPages().filter((page) => page.uri === 'routen/10-tage');
    expect(published.length).toBe(1);
    expect(published[0].title).toBe('Eigene 10-Tage-Route');
  });

  it('veröffentlicht zusätzliche CMS-Seiten neben den Starterseiten', async () => {
    const service = await createService([cmsPage({ uri: 'orte/jaffna', title: 'Jaffna' })]);
    const uris = service.getPublishedPages().map((page) => page.uri);

    expect(uris).toContain('orte/jaffna');
    expect(uris).toContain('orte/hochland');
    expect(service.getPageByUri('gibt-es-nicht')).toBeUndefined();
  });

  it('übernimmt das optionale Prüfdatum aus gespeicherten Seiten', async () => {
    const service = await createService([cmsPage({ uri: 'orte/jaffna', lastReviewed: '2026-10-15' })]);

    expect(service.getPageByUri('orte/jaffna')?.lastReviewed).toBe('2026-10-15');
  });
});
