import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, delay, from, map, of, throwError } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';
import { FIREBASE_CONFIG, isFirebaseConfigured } from './firebase.config';

export interface ContentPage {
  uri: string;
  title: string;
  description: string;
  heroImageUrl: string;
  /** Alternativtext für das Titelbild; leer lassen, wenn das Bild rein dekorativ ist. */
  heroImageAlt?: string;
  customCss: string;
  bodyHtml?: string;
  /** ISO-Datum (YYYY-MM-DD) der letzten inhaltlichen Prüfung, angezeigt als „Stand“. */
  lastReviewed?: string;
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

  /**
   * Redaktionelle Starterseiten (siehe built-in-pages.ts). Sie sorgen dafür, dass
   * alle Links der Startseite auf Inhalte führen. Eine CMS-Seite mit gleicher URI
   * ersetzt die jeweilige Starterseite. Werden als eigener Chunk nachgeladen,
   * damit die Startseite schlank bleibt.
   */
  private builtInPages = new Map<string, ContentPage>();

  private readonly firebase = inject(FIREBASE_CONFIG);
  private readonly auth = inject(AdminAuthService);

  constructor() {
    this.initializePages();
  }

  /** Seiten aus dem CMS (Firestore bzw. lokaler Speicher), ohne Starterseiten. */
  getPages(): ContentPage[] {
    return [...this.pages].sort((a, b) => a.uri.localeCompare(b.uri));
  }

  /** Mitgelieferte Starterseiten, unabhängig davon, ob sie im CMS ersetzt wurden. */
  getBuiltInPages(): ContentPage[] {
    return [...this.builtInPages.values()].sort((a, b) => a.uri.localeCompare(b.uri));
  }

  isBuiltInUri(uri: string): boolean {
    return this.builtInPages.has(uri);
  }

  /** Alle öffentlich erreichbaren Seiten: CMS-Seiten plus nicht ersetzte Starterseiten. */
  getPublishedPages(): ContentPage[] {
    const pagesByUri = new Map(this.builtInPages);
    this.pages.forEach((page) => pagesByUri.set(page.uri, page));
    return [...pagesByUri.values()].sort((a, b) => a.uri.localeCompare(b.uri));
  }

  getPageByUri(uri: string): ContentPage | undefined {
    return this.pages.find((page) => page.uri === uri) ?? this.builtInPages.get(uri);
  }

  /** True, sobald Inhalte aus Google Cloud Firestore geladen werden (relevant für die Datenschutzerklärung). */
  isRemoteContentEnabled(): boolean {
    return this.hasFirebaseConfig();
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
    const [remotePages, builtInPages] = await Promise.all([this.loadPagesFromFirestore(), this.loadBuiltInPages()]);

    this.builtInPages = new Map(builtInPages.map((page) => [page.uri, page]));
    this.pages.splice(0, this.pages.length, ...(remotePages ?? this.loadPagesFromStorage()));
    this.pagesLoadedSubject.next(true);
  }

  private async loadBuiltInPages(): Promise<ContentPage[]> {
    try {
      const { BUILT_IN_PAGES } = await import('./built-in-pages');
      return BUILT_IN_PAGES;
    } catch {
      return [];
    }
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
      headers: await this.authorizedHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ fields: this.toFirestoreFields(page) })
    });

    if (!response.ok) {
      throw new Error(ContentService.describeWriteError(response.status, 'save'));
    }
  }

  private async deletePageRemote(uri: string): Promise<void> {
    if (!this.hasFirebaseConfig()) {
      return;
    }

    const response = await fetch(this.documentUrl(uri), {
      method: 'DELETE',
      headers: await this.authorizedHeaders()
    });

    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      throw new Error(ContentService.describeWriteError(response.status, 'delete'));
    }
  }

  /** Writes must carry the admin's Firebase ID token; firestore.rules only allow listed admins. */
  private async authorizedHeaders(headers: Record<string, string> = {}): Promise<Record<string, string>> {
    const idToken = await this.auth.getIdToken();

    if (!idToken) {
      throw new Error('Your admin session has expired. Please sign in again.');
    }

    return { ...headers, Authorization: `Bearer ${idToken}` };
  }

  private static describeWriteError(status: number, action: 'save' | 'delete'): string {
    if (status === 401 || status === 403) {
      return `Not allowed to ${action} content. Check that your account's UID is listed in firestore.rules.`;
    }

    return `Failed to ${action} content in Firestore (HTTP ${status}).`;
  }

  private loadPagesFromStorage(): ContentPage[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const rawValue = localStorage.getItem(ContentService.STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawValue) as Partial<StoredContentPages>;

      if (parsed.version !== 1 || !Array.isArray(parsed.pages)) {
        return [];
      }

      return parsed.pages.filter((page): page is ContentPage => this.isValidPage(page));
    } catch {
      return [];
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
      (typeof candidate.heroImageAlt === 'undefined' || typeof candidate.heroImageAlt === 'string') &&
      typeof candidate.customCss === 'string' &&
      (typeof candidate.bodyHtml === 'undefined' || typeof candidate.bodyHtml === 'string') &&
      (typeof candidate.lastReviewed === 'undefined' || typeof candidate.lastReviewed === 'string')
    );
  }

  private hasFirebaseConfig(): boolean {
    return isFirebaseConfigured(this.firebase);
  }

  private collectionUrl(): string {
    return `${this.firestoreBaseUrl()}/${ContentService.FIRESTORE_COLLECTION}?key=${this.firebase.apiKey}`;
  }

  private documentUrl(uri: string): string {
    return `${this.firestoreBaseUrl()}/${ContentService.FIRESTORE_COLLECTION}/${encodeURIComponent(uri)}?key=${this.firebase.apiKey}`;
  }

  private firestoreBaseUrl(): string {
    return `https://firestore.googleapis.com/v1/projects/${this.firebase.projectId}/databases/${ContentService.FIRESTORE_DATABASE_ID}/documents`;
  }

  private toFirestoreFields(page: ContentPage): Record<string, { stringValue: string }> {
    return {
      uri: { stringValue: page.uri },
      title: { stringValue: page.title },
      description: { stringValue: page.description },
      heroImageUrl: { stringValue: page.heroImageUrl },
      heroImageAlt: { stringValue: page.heroImageAlt ?? '' },
      customCss: { stringValue: page.customCss },
      bodyHtml: { stringValue: page.bodyHtml ?? '' },
      lastReviewed: { stringValue: page.lastReviewed ?? '' }
    };
  }

  private fromFirestoreDocument(documentValue: FirestoreDocument): ContentPage | null {
    const fields = documentValue.fields ?? {};
    const bodyHtml = fields['bodyHtml']?.stringValue ?? '';
    const lastReviewed = fields['lastReviewed']?.stringValue ?? '';
    const heroImageAlt = fields['heroImageAlt']?.stringValue ?? '';

    const page: ContentPage = {
      uri: fields['uri']?.stringValue ?? '',
      title: fields['title']?.stringValue ?? '',
      description: fields['description']?.stringValue ?? '',
      heroImageUrl: fields['heroImageUrl']?.stringValue ?? '',
      heroImageAlt: heroImageAlt || undefined,
      customCss: fields['customCss']?.stringValue ?? '',
      bodyHtml: bodyHtml || undefined,
      lastReviewed: lastReviewed || undefined
    };

    return this.isValidPage(page) ? page : null;
  }
}
