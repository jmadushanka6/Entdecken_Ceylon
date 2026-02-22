import { Component } from '@angular/core';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  template: `
    <section class="hero" aria-labelledby="home-hero-title">
      <p class="eyebrow">Entdecken Ceylon</p>
      <h1 id="home-hero-title">Sri Lanka erleben, wie es zu Ihnen passt</h1>
      <p class="intro">
        Finden Sie Reiserouten, Inspiration und Insider-Tipps für Ihre nächste Auszeit –
        kuratiert von unserer Redaktion.
      </p>
      <a class="hero-cta" href="/reiseplaner">Reise jetzt planen</a>
    </section>
  `,
  styles: [
    `
      .hero { padding: 3rem 1rem; background: #f5fbf9; border-radius: 1rem; }
      .eyebrow { font-weight: 600; text-transform: uppercase; letter-spacing: .08em; }
      h1 { margin: .5rem 0 1rem; font-size: clamp(2rem, 4vw, 3rem); }
      .intro { max-width: 60ch; }
      .hero-cta { display: inline-block; margin-top: 1rem; padding: .75rem 1rem; border-radius: .5rem; background: #005a4e; color: #fff; text-decoration: none; }
      .hero-cta:focus-visible { outline: 3px solid #ffb703; outline-offset: 3px; }
    `,
  ],
})
export class HomeHeroComponent {}
