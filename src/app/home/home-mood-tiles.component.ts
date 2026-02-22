import { Component } from '@angular/core';

interface MoodTile {
  title: string;
  description: string;
  href: string;
}

@Component({
  selector: 'app-home-mood-tiles',
  standalone: true,
  template: `
    <section aria-labelledby="mood-tiles-title">
      <h2 id="mood-tiles-title">Worauf haben Sie heute Lust?</h2>
      <div class="grid">
        @for (tile of tiles; track tile.title) {
          <a class="card" [href]="tile.href" [attr.aria-label]="tile.title + ': ' + tile.description">
            <h3>{{ tile.title }}</h3>
            <p>{{ tile.description }}</p>
          </a>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
      .card { display: block; padding: 1rem; border: 1px solid #d4e5df; border-radius: .75rem; text-decoration: none; color: inherit; background: #fff; }
      .card:hover { border-color: #6ea497; }
      .card:focus-visible { outline: 3px solid #ffb703; outline-offset: 2px; }
      h3 { margin-top: 0; }
    `,
  ],
})
export class HomeMoodTilesComponent {
  readonly tiles: MoodTile[] = [
    { title: 'Strand & Entspannung', description: 'Ruhige Buchten, Ayurveda und Sonnenuntergänge.', href: '/inspiration/strand' },
    { title: 'Kultur & Geschichte', description: 'Tempel, UNESCO-Stätten und koloniale Architektur.', href: '/inspiration/kultur' },
    { title: 'Natur & Safari', description: 'Nationalparks, Leoparden und Hochlandzüge.', href: '/inspiration/natur' },
    { title: 'Aktiv & Abenteuer', description: 'Surfen, Wandern und verborgene Wasserfälle.', href: '/inspiration/abenteuer' },
  ];
}
