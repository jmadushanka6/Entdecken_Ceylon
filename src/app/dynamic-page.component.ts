import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContentPage, ContentService } from './content.service';

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

  private routeSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly sanitizer: DomSanitizer,
    private readonly contentService: ContentService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.url.subscribe((segments) => {
      const uri = segments.map((segment) => segment.path).join('/');
      this.page = this.contentService.getPageByUri(uri) ?? null;
      this.safeBodyHtml = this.page?.bodyHtml
        ? this.sanitizer.bypassSecurityTrustHtml(this.page.bodyHtml)
        : null;

      this.updateMetadata();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  get currentCustomCss(): string {
    return this.page?.customCss ?? '';
  }

  private updateMetadata(): void {
    const titleText = this.page?.title ?? 'Seite nicht gefunden | Entdecken Ceylon';
    const description = this.page?.description ?? 'Diese Seite wurde nicht gefunden.';

    this.title.setTitle(titleText);
    this.meta.updateTag({
      name: 'description',
      content: description
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
