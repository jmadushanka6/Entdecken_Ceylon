import { Component } from '@angular/core';

@Component({
  selector: 'app-home-last-updated',
  standalone: true,
  template: `
    <section aria-labelledby="last-updated-title">
      <h2 id="last-updated-title">Zuletzt aktualisiert</h2>
      <p>Diese Seite wurde zuletzt am <time datetime="2026-02-22">22. Februar 2026</time> aktualisiert.</p>
    </section>
  `,
})
export class HomeLastUpdatedComponent {}
