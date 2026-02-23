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

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly pages: ContentPage[] = [
    {
      uri: 'best-sri-lanka-route',
      title: 'Best Sri Lanka Route',
      description: 'A handpicked route through Sri Lanka.',
      heroImageUrl: 'https://images.example.com/best-route.jpg',
      customCss: ''
    }
  ];

  getPages(): ContentPage[] {
    return [...this.pages];
  }

  isUriTaken(uri: string): boolean {
    return this.pages.some((page) => page.uri === uri);
  }

  createPage(page: ContentPage): Observable<ContentPage> {
    if (this.isUriTaken(page.uri)) {
      return throwError(() => new Error('URI already exists. Please choose another slug.'));
    }

    this.pages.push(page);
    return of(page).pipe(delay(250));
  }
}
