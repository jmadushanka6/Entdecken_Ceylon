import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoPayload {
  title: string;
  description: string;
  ogImage?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  updateTags(payload: SeoPayload): void {
    this.title.setTitle(payload.title);
    this.meta.updateTag({ name: 'description', content: payload.description });
    this.meta.updateTag({ property: 'og:title', content: payload.title });
    this.meta.updateTag({ property: 'og:description', content: payload.description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    if (payload.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: payload.ogImage });
    }
  }
}
