import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export interface DynamicPageThemeTokens {
  accent?: string;
  background?: string;
  surface?: string;
  text?: string;
  description?: string;
}

export interface DynamicPageContent {
  id?: string;
  title: string;
  heroImage: string;
  heroAlt: string;
  description: string;
  bodyHtml?: string;
  customCss?: string;
  theme?: DynamicPageThemeTokens;
}

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dynamic-page.component.html',
  styleUrl: './dynamic-page.component.scss'
})
export class DynamicPageComponent implements OnChanges {
  @Input({ required: true }) page!: DynamicPageContent;

  protected wrapperClass = 'dynamic-page--default';
  protected safeBodyHtml: string | null = null;
  protected safeScopedCss = '';

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    this.wrapperClass = `dynamic-page--${this.toSafeId(this.page.id ?? this.page.title)}`;

    this.safeBodyHtml = this.page.bodyHtml
      ? this.sanitizer.sanitize(SecurityContext.HTML, this.page.bodyHtml)
      : null;

    this.safeScopedCss = this.page.customCss
      ? this.sanitizeCss(this.scopeCss(this.page.customCss, `.${this.wrapperClass}`))
      : '';
  }

  protected get cssVariables(): Record<string, string | null> {
    return {
      '--page-accent': this.page.theme?.accent ?? null,
      '--page-bg': this.page.theme?.background ?? null,
      '--page-surface': this.page.theme?.surface ?? null,
      '--page-text': this.page.theme?.text ?? null,
      '--page-description': this.page.theme?.description ?? null
    };
  }

  /**
   * Trust model: custom CSS should come from trusted content editors only.
   * We still scope selectors and block dangerous constructs before injection.
   */
  private sanitizeCss(css: string): string {
    const stripped = css
      .replace(/@import/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/behavior\s*:/gi, '')
      .replace(/-moz-binding\s*:/gi, '');

    return this.sanitizer.sanitize(SecurityContext.STYLE, stripped) ?? '';
  }

  private scopeCss(css: string, scopeSelector: string): string {
    const normalized = css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();

    return normalized.replace(/(^|})\s*([^@{}][^{]+)\{/g, (_match, prefix: string, selectors: string) => {
      const scoped = selectors
        .split(',')
        .map((selector) => {
          const trimmed = selector.trim();
          if (!trimmed) {
            return '';
          }

          return trimmed.startsWith(scopeSelector) ? trimmed : `${scopeSelector} ${trimmed}`;
        })
        .filter(Boolean)
        .join(', ');

      return `${prefix} ${scoped} {`;
    });
  }

  private toSafeId(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'page';
  }
}
