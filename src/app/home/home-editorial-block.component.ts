import { Component } from '@angular/core';

@Component({
  selector: 'app-home-editorial-block',
  standalone: true,
  template: `
    <section aria-labelledby="editorial-title">
      <h2 id="editorial-title">Aus der Redaktion</h2>
      <article>
        <h3>Wann ist die beste Reisezeit für Sri Lanka?</h3>
        <p>
          Unsere Redaktion erklärt, welche Region zu welcher Jahreszeit ideal ist –
          inklusive Monsun-Übersicht und Monatsvergleich.
        </p>
        <a href="/magazin/beste-reisezeit" aria-label="Artikel zur besten Reisezeit lesen">Artikel lesen</a>
      </article>
    </section>
  `,
  styles: [
    `a:focus-visible { outline: 3px solid #ffb703; outline-offset: 3px; }`,
  ],
})
export class HomeEditorialBlockComponent {}
