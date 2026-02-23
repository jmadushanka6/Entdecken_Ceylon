import { Injectable } from '@angular/core';

export interface DynamicPage {
  slug: string;
  title: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class DynamicPageService {
  private readonly pages: DynamicPage[] = [
    {
      slug: 'reise-planen',
      title: 'Reise planen',
      body: 'Hier finden Sie hilfreiche Infos für die Reiseplanung Ihrer Sri-Lanka-Reise.'
    },
    {
      slug: 'routen',
      title: 'Routenideen',
      body: 'Unsere beliebtesten Sri-Lanka-Routen für unterschiedliche Reisedauern.'
    }
  ];

  getPageBySlug(slug: string): DynamicPage | undefined {
    return this.pages.find((page) => page.slug === slug);
  }
}
