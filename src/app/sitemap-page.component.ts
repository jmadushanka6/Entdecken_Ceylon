import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ContentService } from './content.service';
import { SeoService } from './seo.service';

interface SitemapLink {
  title: string;
  path: string;
}

interface SitemapGroup {
  label: string;
  links: SitemapLink[];
}

const GROUP_BY_SECTION: Record<string, string> = {
  'reise-planen': 'Reiseplanung',
  kosten: 'Reiseplanung',
  sicherheit: 'Reiseplanung',
  routen: 'Routen',
  orte: 'Regionen'
};

const GROUP_ORDER = ['Reiseplanung', 'Routen', 'Regionen', 'Weitere Seiten'];

@Component({
  selector: 'app-sitemap-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sitemap-page.component.html'
})
export class SitemapPageComponent implements OnInit, OnDestroy {
  groups: SitemapGroup[] = [];
  isLoading = true;

  readonly serviceLinks: SitemapLink[] = [
    { title: 'Kontakt', path: '/kontakt' },
    { title: 'Impressum', path: '/impressum' },
    { title: 'Datenschutzerklärung', path: '/datenschutz' }
  ];

  private pagesSubscription?: Subscription;

  constructor(
    private readonly contentService: ContentService,
    private readonly seo: SeoService
  ) {}

  ngOnInit(): void {
    this.seo.update({ title: 'Sitemap', description: 'Alle Seiten von Entdecken Ceylon im Überblick.' });

    this.pagesSubscription = this.contentService.pagesLoaded$
      .pipe(filter((isLoaded) => isLoaded))
      .subscribe(() => {
        this.groups = this.buildGroups();
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.pagesSubscription?.unsubscribe();
  }

  private buildGroups(): SitemapGroup[] {
    const linksByGroup = new Map<string, Array<SitemapLink & { isHub: boolean }>>();

    for (const page of this.contentService.getPublishedPages()) {
      const label = GROUP_BY_SECTION[page.uri.split('/')[0]] ?? 'Weitere Seiten';
      const links = linksByGroup.get(label) ?? [];
      links.push({ title: page.title, path: `/${page.uri}`, isHub: !page.uri.includes('/') });
      linksByGroup.set(label, links);
    }

    return GROUP_ORDER.filter((label) => linksByGroup.has(label)).map((label) => ({
      label,
      links: (linksByGroup.get(label) ?? [])
        // Übersichtsseiten zuerst, danach alphabetisch.
        .sort((a, b) => Number(b.isHub) - Number(a.isHub) || a.title.localeCompare(b.title, 'de'))
        .map(({ title, path }) => ({ title, path }))
    }));
  }
}
