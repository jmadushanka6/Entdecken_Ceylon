import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

export interface PageMetadata {
  title: string;
  description?: string;
  /** Für Fehlerseiten: Suchmaschinen sollen die Seite nicht indexieren. */
  noIndex?: boolean;
}

/**
 * Setzt Titel, Beschreibung, Robots-Tag und Canonical-URL. Wird von jeder
 * Seite aufgerufen, damit bei Navigation innerhalb der App keine Metadaten der
 * vorherigen Seite stehen bleiben.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  static readonly SITE_NAME = 'Entdecken Ceylon';

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly router: Router,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  update({ title, description, noIndex = false }: PageMetadata): void {
    const fullTitle = title.includes(SeoService.SITE_NAME) ? title : `${title} | ${SeoService.SITE_NAME}`;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ property: 'og:title', content: fullTitle });

    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
    }

    this.meta.updateTag({
      name: 'robots',
      content: noIndex ? 'noindex,follow' : 'index,follow,max-image-preview:large'
    });

    this.updateCanonicalUrl();
  }

  private updateCanonicalUrl(): void {
    const currentPath = this.router.url.split(/[?#]/)[0] || '/';
    const canonicalUrl = `${this.document.location.origin}${currentPath}`;

    let canonicalElement = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!canonicalElement) {
      canonicalElement = this.document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonicalElement);
    }

    canonicalElement.setAttribute('href', canonicalUrl);
  }
}
