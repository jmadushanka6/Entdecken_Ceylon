import { Component } from '@angular/core';

@Component({
  selector: 'app-home-featured-route',
  standalone: true,
  template: `
    <section aria-labelledby="featured-route-title">
      <h2 id="featured-route-title">Empfohlene Route der Woche</h2>
      <a class="route-card" href="/routen/14-tage-rundreise" aria-label="Zur 14 Tage Route: Küste, Kultur und Hochland">
        <h3>14 Tage: Küste, Kultur & Hochland</h3>
        <p>Von Negombo über Kandy bis Ella – die perfekte Mischung für den ersten Sri-Lanka-Besuch.</p>
        <span>Route ansehen</span>
      </a>
    </section>
  `,
  styles: [
    `
      .route-card { display: block; padding: 1rem; border-radius: .75rem; background: #f8f8ff; text-decoration: none; color: inherit; }
      .route-card:focus-visible { outline: 3px solid #ffb703; outline-offset: 3px; }
      span { color: #005a4e; font-weight: 600; }
    `,
  ],
})
export class HomeFeaturedRouteComponent {}
