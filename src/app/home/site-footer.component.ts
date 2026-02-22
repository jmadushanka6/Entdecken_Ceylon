import { Component } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  template: `
    <footer class="site-footer" aria-label="Fußbereich">
      <nav aria-label="Footer Navigation">
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
        <a href="/kontakt">Kontakt</a>
      </nav>
      <p>© Entdecken Ceylon</p>
    </footer>
  `,
  styles: [
    `
      .site-footer { margin-top: 2rem; padding: 1.5rem 0; border-top: 1px solid #d4e5df; }
      nav { display: flex; gap: 1rem; flex-wrap: wrap; }
      a:focus-visible { outline: 3px solid #ffb703; outline-offset: 3px; }
    `,
  ],
})
export class SiteFooterComponent {}
