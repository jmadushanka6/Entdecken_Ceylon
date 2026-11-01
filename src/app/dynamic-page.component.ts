import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { ContentPage, ContentService } from './content.service';
import { SeoService } from './seo.service';

interface Breadcrumb {
  label: string;
  path: string;
}

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dynamic-page.component.html',
  styleUrl: './dynamic-page.component.scss'
})
export class DynamicPageComponent implements OnInit, OnDestroy {
  page: ContentPage | null = null;
  safeBodyHtml: SafeHtml | null = null;
  breadcrumbs: Breadcrumb[] = [];
  isPageLoading = true;
  isHeroImageLoading = false;

  private routeSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
    private readonly contentService: ContentService,
    private readonly seo: SeoService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = combineLatest([this.route.url, this.contentService.pagesLoaded$]).subscribe(
      ([segments, isLoaded]) => {
        if (!isLoaded) {
          this.isPageLoading = true;
          return;
        }

        const uri = segments.map((segment) => segment.path).join('/');
        this.page = this.contentService.getPageByUri(uri) ?? null;
        this.safeBodyHtml = this.page?.bodyHtml
          ? this.sanitizer.bypassSecurityTrustHtml(this.page.bodyHtml)
          : null;
        this.breadcrumbs = this.page ? this.buildBreadcrumbs(uri) : [];

        this.isPageLoading = false;
        this.isHeroImageLoading = !!this.page?.heroImageUrl;
        this.updateMetadata();
      }
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  onHeroImageLoaded(): void {
    this.isHeroImageLoading = false;
  }

  get currentCustomCss(): string {
    return this.page?.customCss ?? '';
  }

  /**
   * Links im Seiteninhalt sind normale <a href="/…">. Interne Links werden
   * innerhalb der App geöffnet, statt die komplette Seite neu zu laden.
   */
  onBodyClick(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const anchor = (event.target as Element | null)?.closest?.('a');
    const href = anchor?.getAttribute('href');

    if (!anchor || !href || anchor.target || anchor.hasAttribute('download')) {
      return;
    }

    if (href.startsWith('/') && !href.startsWith('//')) {
      event.preventDefault();
      void this.router.navigateByUrl(href);
    }
  }

  private buildBreadcrumbs(uri: string): Breadcrumb[] {
    const segments = uri.split('/');
    const crumbs: Breadcrumb[] = [];

    // Übergeordnete Ebenen nur aufnehmen, wenn dort tatsächlich eine Seite existiert.
    for (let depth = 1; depth < segments.length; depth++) {
      const parentUri = segments.slice(0, depth).join('/');
      const parent = this.contentService.getPageByUri(parentUri);

      if (parent) {
        crumbs.push({ label: parent.title, path: `/${parentUri}` });
      }
    }

    return crumbs;
  }

  private updateMetadata(): void {
    if (!this.page) {
      this.seo.update({
        title: 'Seite nicht gefunden',
        description: 'Diese Seite wurde nicht gefunden.',
        noIndex: true
      });
      return;
    }

    this.seo.update({ title: this.page.title, description: this.page.description });
  }
}
