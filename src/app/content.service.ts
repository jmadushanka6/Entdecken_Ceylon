import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, from, map, of, throwError } from 'rxjs';
import { firebaseClientConfig } from './firebase.config';

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

interface FirestoreDocument {
  fields?: Record<string, { stringValue?: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private static readonly STORAGE_KEY = 'content-pages';
  private static readonly FIRESTORE_DATABASE_ID = 'x';
  private static readonly FIRESTORE_COLLECTION = 'y';

  private readonly pages: ContentPage[] = [];
  private readonly pagesLoadedSubject = new BehaviorSubject<boolean>(false);

  readonly pagesLoaded$ = this.pagesLoadedSubject.asObservable();

  private readonly defaultPages: ContentPage[] = [
    {
      uri: 'best-sri-lanka-route',
      title: 'Best Sri Lanka Route',
      description: 'A handpicked route through Sri Lanka.',
      heroImageUrl: 'https://images.example.com/best-route.jpg',
      customCss: ''
    }
  ];

  constructor() {
    this.initializePages();
  }

  getPages(): ContentPage[] {
    return [...this.pages].sort((a, b) => a.uri.localeCompare(b.uri));
  }

  getPageByUri(uri: string): ContentPage | undefined {
    return this.pages.find((page) => page.uri === uri);
  }

  isUriTaken(uri: string, excludeUri?: string): boolean {
    return this.pages.some((page) => page.uri === uri && page.uri !== excludeUri);
  }

  createPage(page: ContentPage): Observable<ContentPage> {
    if (this.isUriTaken(page.uri)) {
      return throwError(() => new Error('URI already exists. Please choose another slug.'));
    }

    return from(this.upsertPageRemote(page)).pipe(
      map(() => {
        this.pages.push(page);
        this.persistPages();
        return page;
      }),
      delay(250)
    );
  }

  updatePage(originalUri: string, page: ContentPage): Observable<ContentPage> {
    const pageIndex = this.pages.findIndex((existingPage) => existingPage.uri === originalUri);

    if (pageIndex < 0) {
      return throwError(() => new Error('Page not found.'));
    }

    if (this.isUriTaken(page.uri, originalUri)) {
      return throwError(() => new Error('URI already exists. Please choose another slug.'));
    }

    const previousUri = this.pages[pageIndex].uri;

    return from(this.upsertPageRemote(page, previousUri)).pipe(
      map(() => {
        this.pages[pageIndex] = page;
        this.persistPages();
        return page;
      }),
      delay(250)
    );
  }

  hasDescendantPages(uri: string): boolean {
    const normalized = `${uri}/`;
    return this.pages.some((page) => page.uri.startsWith(normalized));
  }

  deletePage(uri: string): Observable<void> {
    if (this.hasDescendantPages(uri)) {
      return throwError(() => new Error('Cannot delete this URI because it has child routes.'));
    }

    const pageIndex = this.pages.findIndex((page) => page.uri === uri);

    if (pageIndex < 0) {
      return throwError(() => new Error('Page not found.'));
    }

    return from(this.deletePageRemote(uri)).pipe(
      map(() => {
        this.pages.splice(pageIndex, 1);
        this.persistPages();
        return void 0;
      }),
      delay(250)
    );
  }

  private async initializePages(): Promise<void> {
    const remotePages = await this.loadPagesFromFirestore();

    this.pages.splice(0, this.pages.length, ...(remotePages ?? this.loadPagesFromStorage()));

    if (!this.pages.length) {
      this.pages.push(...this.defaultPages);
      this.persistPages();
    }

    this.pagesLoadedSubject.next(true);
  }

  private async loadPagesFromFirestore(): Promise<ContentPage[] | null> {
    if (!this.hasFirebaseConfig()) {
      return null;
    }

    try {
      const response = await fetch(this.collectionUrl());

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as { documents?: FirestoreDocument[] };

      if (!Array.isArray(payload.documents)) {
        return [];
      }

      return payload.documents
        .map((documentValue) => this.fromFirestoreDocument(documentValue))
        .filter((page): page is ContentPage => this.isValidPage(page));
    } catch {
      return null;
    }
  }

  private async upsertPageRemote(page: ContentPage, previousUri?: string): Promise<void> {
    if (!this.hasFirebaseConfig()) {
      return;
    }

    if (previousUri && previousUri !== page.uri) {
      await this.deletePageRemote(previousUri);
    }

    const response = await fetch(this.documentUrl(page.uri), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: this.toFirestoreFields(page) })
    });

    if (!response.ok) {
      throw new Error('Failed to save content in Firestore.');
    }
  }

  private async deletePageRemote(uri: string): Promise<void> {
    if (!this.hasFirebaseConfig()) {
      return;
    }

    const response = await fetch(this.documentUrl(uri), { method: 'DELETE' });

    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to delete content in Firestore.');
    }
  }

  private loadPagesFromStorage(): ContentPage[] {
    if (typeof localStorage === 'undefined') {
      return [...this.defaultPages];
    }

    const rawValue = localStorage.getItem(ContentService.STORAGE_KEY);

    if (!rawValue) {
      return [...this.defaultPages];
    }

    try {
      const parsed = JSON.parse(rawValue) as Partial<StoredContentPages>;

      if (parsed.version !== 1 || !Array.isArray(parsed.pages)) {
        return [...this.defaultPages];
      }

      return parsed.pages.filter((page): page is ContentPage => this.isValidPage(page));
    } catch {
      return [...this.defaultPages];
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

  private isValidPage(page: unknown): page is ContentPage {
    const candidate = page as Partial<ContentPage>;

    return (
      !!candidate &&
      typeof candidate.uri === 'string' &&
      typeof candidate.title === 'string' &&
      typeof candidate.description === 'string' &&
      typeof candidate.heroImageUrl === 'string' &&
      typeof candidate.customCss === 'string' &&
      (typeof candidate.bodyHtml === 'undefined' || typeof candidate.bodyHtml === 'string')
    );
  }

  private hasFirebaseConfig(): boolean {
    return (
      typeof firebaseClientConfig.apiKey === 'string' &&
      firebaseClientConfig.apiKey.length > 0 &&
      !firebaseClientConfig.apiKey.startsWith('YOUR_FIREBASE_') &&
      typeof firebaseClientConfig.projectId === 'string' &&
      firebaseClientConfig.projectId.length > 0 &&
      !firebaseClientConfig.projectId.startsWith('YOUR_FIREBASE_')
    );
  }

  private collectionUrl(): string {
    return `https://firestore.googleapis.com/v1/projects/${firebaseClientConfig.projectId}/databases/${ContentService.FIRESTORE_DATABASE_ID}/documents/${ContentService.FIRESTORE_COLLECTION}?key=${firebaseClientConfig.apiKey}`;
  }

  private documentUrl(uri: string): string {
    return `${this.collectionUrl()}/${encodeURIComponent(uri)}`;
  }

  private toFirestoreFields(page: ContentPage): Record<string, { stringValue: string }> {
    return {
      uri: { stringValue: page.uri },
      title: { stringValue: page.title },
      description: { stringValue: page.description },
      heroImageUrl: { stringValue: page.heroImageUrl },
      customCss: { stringValue: page.customCss },
      bodyHtml: { stringValue: page.bodyHtml ?? '' }
    };
  }

  private fromFirestoreDocument(documentValue: FirestoreDocument): ContentPage | null {
    const fields = documentValue.fields ?? {};
    const bodyHtml = fields['bodyHtml']?.stringValue ?? '';

    const page: ContentPage = {
      uri: fields['uri']?.stringValue ?? '',
      title: fields['title']?.stringValue ?? '',
      description: fields['description']?.stringValue ?? '',
      heroImageUrl: fields['heroImageUrl']?.stringValue ?? '',
      customCss: fields['customCss']?.stringValue ?? '',
      bodyHtml: bodyHtml || undefined
    };

    return this.isValidPage(page) ? page : null;
  }
}
