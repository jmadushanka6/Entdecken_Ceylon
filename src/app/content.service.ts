import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { firebaseConfig, firebasePagesCollection } from './firebase.config';

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

  private readonly pages: ContentPage[] = [];
  private initialized = false;

  async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const loadedPages = await this.loadPages();
    this.pages.splice(0, this.pages.length, ...loadedPages);
    this.initialized = true;
  }

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
    return from(this.createPageAsync(page));
  }

  private async createPageAsync(page: ContentPage): Promise<ContentPage> {
    await this.ensureInitialized();

    if (this.isUriTaken(page.uri)) {
      throw new Error('URI already exists. Please choose another slug.');
    }

    if (this.hasFirebaseConfiguration()) {
      await this.upsertPageInFirestore(page);
    } else {
      this.persistPagesToLocalStorage([...this.pages, page]);
    }

    this.pages.push(page);
    return page;
  }

  private async loadPages(): Promise<ContentPage[]> {
    const defaultPages: ContentPage[] = [
      {
        uri: 'best-sri-lanka-route',
        title: 'Best Sri Lanka Route',
        description: 'A handpicked route through Sri Lanka.',
        heroImageUrl: 'https://images.example.com/best-route.jpg',
        customCss: ''
      }
    ];

    if (this.hasFirebaseConfiguration()) {
      const pagesFromFirestore = await this.getPagesFromFirestore();
      return pagesFromFirestore.length > 0 ? pagesFromFirestore : defaultPages;
    }

    return this.loadPagesFromLocalStorage(defaultPages);
  }

  private async getPagesFromFirestore(): Promise<ContentPage[]> {
    const projectId = firebaseConfig.projectId;
    const apiKey = firebaseConfig.apiKey;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${firebasePagesCollection}?key=${apiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to load data from Firestore.');
      }

      const payload = (await response.json()) as {
        documents?: Array<{ name?: string; fields?: Record<string, { stringValue?: string }> }>;
      };

      if (!Array.isArray(payload.documents)) {
        return [];
      }

      return payload.documents
        .map((document) => this.mapFirestoreDocument(document))
        .filter((page): page is ContentPage => !!page);
    } catch {
      return [];
    }
  }

  private async upsertPageInFirestore(page: ContentPage): Promise<void> {
    const projectId = firebaseConfig.projectId;
    const apiKey = firebaseConfig.apiKey;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${firebasePagesCollection}/${page.uri}?key=${apiKey}`;

    const body = {
      fields: {
        uri: { stringValue: page.uri },
        title: { stringValue: page.title },
        description: { stringValue: page.description },
        heroImageUrl: { stringValue: page.heroImageUrl },
        customCss: { stringValue: page.customCss },
        bodyHtml: { stringValue: page.bodyHtml ?? '' }
      }
    };

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Failed to save page to Firestore. Check Firebase config and rules.');
    }
  }

  private mapFirestoreDocument(document: {
    name?: string;
    fields?: Record<string, { stringValue?: string }>;
  }): ContentPage | null {
    const fields = document.fields;

    if (!fields) {
      return null;
    }

    const mappedPage: ContentPage = {
      uri: fields['uri']?.stringValue ?? '',
      title: fields['title']?.stringValue ?? '',
      description: fields['description']?.stringValue ?? '',
      heroImageUrl: fields['heroImageUrl']?.stringValue ?? '',
      customCss: fields['customCss']?.stringValue ?? '',
      bodyHtml: fields['bodyHtml']?.stringValue || undefined
    };

    return this.isValidPage(mappedPage) ? mappedPage : null;
  }

  private loadPagesFromLocalStorage(defaultPages: ContentPage[]): ContentPage[] {
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

      return parsed.pages.filter((page): page is ContentPage => this.isValidPage(page));
    } catch {
      return defaultPages;
    }
  }

  private persistPagesToLocalStorage(pages: ContentPage[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const payload: StoredContentPages = {
      version: 1,
      pages
    };

    localStorage.setItem(ContentService.STORAGE_KEY, JSON.stringify(payload));
  }

  private hasFirebaseConfiguration(): boolean {
    return Object.values(firebaseConfig).every((value) => !value.includes('REPLACE_WITH_'));
  }

  private isValidPage(page: unknown): page is ContentPage {
    if (!page || typeof page !== 'object') {
      return false;
    }

    const candidate = page as Partial<ContentPage>;

    return (
      typeof candidate.uri === 'string' &&
      typeof candidate.title === 'string' &&
      typeof candidate.description === 'string' &&
      typeof candidate.heroImageUrl === 'string' &&
      typeof candidate.customCss === 'string'
    );
  }
}
