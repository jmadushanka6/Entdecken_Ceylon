import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

interface DynamicPageData {
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
}

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="dynamic-page">
      <div class="container">
        <p class="dynamic-page__label">Inhalt in Vorbereitung</p>
        <h1>{{ pageData?.title ?? fallbackMetadata.title }}</h1>
        <p>{{ pageData?.description ?? fallbackMetadata.description }}</p>
        <a routerLink="/">Zurück zur Startseite</a>
      </div>
    </main>
  `,
  styles: [
    `
      .dynamic-page {
        padding: 3rem 0;
      }

      .container {
        width: min(900px, 92vw);
        margin: 0 auto;
      }

      .dynamic-page__label {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
    `
  ]
})
export class DynamicPageComponent implements OnInit, OnDestroy {
  pageData: DynamicPageData | null = null;

  readonly fallbackMetadata: DynamicPageData = {
    title: 'Entdecken Ceylon',
    description: 'Reiseinhalte werden geladen. Bitte schauen Sie in Kürze wieder vorbei.',
    seoTitle: 'Entdecken Ceylon | Sri Lanka Reisetipps',
    seoDescription: 'Praktische Sri Lanka Reisetipps, Inspiration und aktuelle Hinweise für Ihre Reiseplanung.'
  };

  private readonly pageDataBySlug: Record<string, DynamicPageData> = {
    'beste-reisezeit': {
      title: 'Beste Reisezeit für Sri Lanka',
      description: 'Wann sich welche Region besonders lohnt und worauf Sie bei Monsunzeiten achten sollten.',
      seoTitle: 'Beste Reisezeit Sri Lanka | Entdecken Ceylon',
      seoDescription: 'Monatsübersicht für Wetter, Regenzeiten und optimale Reiseplanung für Sri Lanka.'
    },
    '2-wochen-budget': {
      title: 'Sri Lanka Kosten für 2 Wochen',
      description: 'Budgetbeispiele für Unterkünfte, Transport und Aktivitäten im Überblick.'
    },
    'ist-sri-lanka-sicher': {
      title: 'Ist Sri Lanka sicher?',
      description: 'Sicherheitslage, Gesundheitstipps und Verhaltensempfehlungen für unterwegs.'
    }
  };

  private routeSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((paramMap) => {
      const slug = paramMap.get('slug') ?? '';
      this.pageData = this.pageDataBySlug[slug] ?? null;
      this.updateMetadata(this.pageData);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  private updateMetadata(pageData: DynamicPageData | null): void {
    const metadata = pageData ?? this.fallbackMetadata;

    this.title.setTitle(metadata.seoTitle || metadata.title);
    this.meta.updateTag({
      name: 'description',
      content: metadata.seoDescription || metadata.description
    });

    this.updateCanonicalUrl();
  }

  private updateCanonicalUrl(): void {
    const currentPath = this.router.url.split('?')[0] || '/';
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
