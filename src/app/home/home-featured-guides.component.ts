import { Component } from '@angular/core';

interface Guide {
  title: string;
  href: string;
}

@Component({
  selector: 'app-home-featured-guides',
  standalone: true,
  template: `
    <section aria-labelledby="featured-guides-title">
      <h2 id="featured-guides-title">Beliebte Guides</h2>
      <div class="guides">
        @for (guide of guides; track guide.title) {
          <a class="guide" [href]="guide.href" [attr.aria-label]="guide.title + ' öffnen'">
            <h3>{{ guide.title }}</h3>
            <span>Guide lesen</span>
          </a>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .guides { display: grid; gap: .75rem; }
      .guide { display:block; padding: 1rem; border: 1px solid #d4e5df; border-radius: .75rem; text-decoration:none; color: inherit; }
      .guide:focus-visible { outline: 3px solid #ffb703; outline-offset: 3px; }
      span { color: #005a4e; font-weight: 600; }
    `,
  ],
})
export class HomeFeaturedGuidesComponent {
  readonly guides: Guide[] = [
    { title: 'Zugfahren in Sri Lanka: Tipps & Strecken', href: '/guides/zugfahren-sri-lanka' },
    { title: 'Sri Lanka mit Kindern', href: '/guides/familienreise' },
    { title: 'Budget-Guide: günstig reisen', href: '/guides/budget-guide' },
  ];
}
