import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

export interface ContentPage {
  uri: string;
  title: string;
  description: string;
  heroImageUrl: string;
  customCss: string;
  bodyHtml?: string;
}

interface StoredContentPages {
  version: 1;
  pages: ContentPage[];
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private static readonly STORAGE_KEY = 'content-pages';

  private readonly pages: ContentPage[] = this.loadPages();

  getPages(): ContentPage[] {
    return [...this.pages];
  }

  getPageByUri(uri: string): ContentPage | undefined {
    return this.pages.find((page) => page.uri === uri);
  }

  isUriTaken(uri: string): boolean {
    return this.pages.some((page) => page.uri === uri);
  }

  createPage(page: ContentPage): Observable<ContentPage> {
    if (this.isUriTaken(page.uri)) {
      return throwError(() => new Error('URI already exists. Please choose another slug.'));
    }

    this.pages.push(page);
    this.persistPages();
    return of(page).pipe(delay(250));
  }

  private loadPages(): ContentPage[] {
    const defaultPages: ContentPage[] = [
      {
        uri: 'best-sri-lanka-route',
        title: 'Best Sri Lanka Route',
        description: 'A handpicked route through Sri Lanka.',
        heroImageUrl: 'https://images.example.com/best-route.jpg',
        customCss: ''
      }
    ];

    if (typeof localStorage === 'undefined') {
      return defaultPages;
    }

    const rawValue = localStorage.getItem(ContentService.STORAGE_KEY);

    if (!rawValue) {
      return defaultPages;
    }

    try {
      const parsed = JSON.parse(rawValue) as Partial<StoredContentPages>;

      if (parsed.version !== 1 || !Array.isArray(parsed.pages)) {
        return defaultPages;
      }

      return parsed.pages.filter((page): page is ContentPage => {
        return !!page && typeof page.uri === 'string' && typeof page.title === 'string' && typeof page.description === 'string' && typeof page.heroImageUrl === 'string' && typeof page.customCss === 'string';
      });
    } catch {
      return defaultPages;
    }
  }

  private persistPages(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const payload: StoredContentPages = {
      version: 1,
      pages: this.pages
    };

    localStorage.setItem(ContentService.STORAGE_KEY, JSON.stringify(payload));
  }
}
