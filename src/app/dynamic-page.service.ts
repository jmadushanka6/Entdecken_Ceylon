import { Injectable } from '@angular/core';

export type DynamicPage = Record<string, unknown>;

interface DynamicPageStoragePayload {
  version: number;
  pages: Array<[string, DynamicPage]>;
}

@Injectable({
  providedIn: 'root'
})
export class DynamicPageService {
  private static readonly STORAGE_KEY = 'dynamic-pages';
  private static readonly STORAGE_VERSION = 1;

  private readonly pageMap = new Map<string, DynamicPage>();

  constructor() {
    this.hydrateFromStorage();
  }

  getPageMap(): Map<string, DynamicPage> {
    return new Map(this.pageMap);
  }

  getPage(slug: string): DynamicPage | undefined {
    return this.pageMap.get(slug);
  }

  addPage(slug: string, page: DynamicPage): void {
    this.pageMap.set(slug, page);
    this.persistToStorage();
  }

  updatePage(slug: string, page: DynamicPage): void {
    this.pageMap.set(slug, page);
    this.persistToStorage();
  }

  deletePage(slug: string): void {
    this.pageMap.delete(slug);
    this.persistToStorage();
  }

  private hydrateFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const raw = localStorage.getItem(DynamicPageService.STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      if (!this.isValidStoragePayload(parsed)) {
        return;
      }

      this.pageMap.clear();
      parsed.pages.forEach(([slug, page]) => {
        this.pageMap.set(slug, page);
      });
    } catch {
      // Ignore parse failures and fall back to in-memory defaults.
    }
  }

  private persistToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const payload: DynamicPageStoragePayload = {
      version: DynamicPageService.STORAGE_VERSION,
      pages: Array.from(this.pageMap.entries())
    };

    localStorage.setItem(DynamicPageService.STORAGE_KEY, JSON.stringify(payload));
  }

  private isValidStoragePayload(value: unknown): value is DynamicPageStoragePayload {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<DynamicPageStoragePayload>;

    if (candidate.version !== DynamicPageService.STORAGE_VERSION || !Array.isArray(candidate.pages)) {
      return false;
    }

    return candidate.pages.every((entry) => {
      if (!Array.isArray(entry) || entry.length !== 2) {
        return false;
      }

      const [slug, page] = entry;
      return typeof slug === 'string' && !!page && typeof page === 'object' && !Array.isArray(page);
    });
  }
}
