import { Injectable } from '@angular/core';

export interface DynamicPage {
  uri: string;
  title: string;
  description: string;
  heroImageUrl: string;
  bodyHtml: string;
  customCss: string;
  seoTitle?: string;
  seoDescription?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DynamicPageService {
  /**
   * In-memory only store for development.
   *
   * NOTE:
   * - Data is not persisted anywhere.
   * - The Map is re-created on app start and resets on every browser refresh.
   */
  private readonly pages = new Map<string, DynamicPage>();

  constructor() {
    this.seedSampleData();
  }

  addPage(page: DynamicPage): void {
    const normalizedUri = this.normalizeUri(page.uri);
    this.pages.set(normalizedUri, {
      ...page,
      uri: normalizedUri
    });
  }

  getPageByUri(uri: string): DynamicPage | undefined {
    return this.pages.get(this.normalizeUri(uri));
  }

  listPages(): DynamicPage[] {
    return Array.from(this.pages.values());
  }

  exists(uri: string): boolean {
    return this.pages.has(this.normalizeUri(uri));
  }

  private seedSampleData(): void {
    const samplePages: DynamicPage[] = [
      {
        uri: '/guides/sri-lanka-einreise',
        title: 'Einreise nach Sri Lanka',
        description: 'Kurzübersicht zu ETA, Gültigkeit und den wichtigsten Dokumenten.',
        heroImageUrl: '/assets/images/guide-visa.svg',
        bodyHtml:
          '<h2>Einreise kompakt</h2><p>Für touristische Aufenthalte benötigen viele Reisende eine ETA. Prüfen Sie die offiziellen Anforderungen vor Abreise.</p>',
        customCss: '.dynamic-page h2 { margin-top: 0; }',
        seoTitle: 'Einreise Sri Lanka 2026 – ETA, Dokumente, Tipps',
        seoDescription:
          'Die wichtigsten Informationen zur touristischen Einreise nach Sri Lanka auf einen Blick.'
      },
      {
        uri: '/guides/sri-lanka-rundreise-14-tage',
        title: 'Sri Lanka Rundreise in 14 Tagen',
        description: 'Beispielroute mit Küste, Hochland und Kulturstätten.',
        heroImageUrl: '/assets/images/guide-route-14.svg',
        bodyHtml:
          '<h2>Route für 2 Wochen</h2><p>Diese Route verbindet Colombo, Kandy, Ella und die Südküste mit ausgewogenen Fahrzeiten.</p>',
        customCss: '.dynamic-page p { line-height: 1.7; }'
      }
    ];

    samplePages.forEach((page) => this.addPage(page));
  }

  private normalizeUri(uri: string): string {
    const trimmed = uri.trim().toLowerCase();
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }
}
