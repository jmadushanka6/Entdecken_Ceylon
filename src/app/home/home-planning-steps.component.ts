import { Component } from '@angular/core';

@Component({
  selector: 'app-home-planning-steps',
  standalone: true,
  template: `
    <section aria-labelledby="planning-steps-title">
      <h2 id="planning-steps-title">In 3 Schritten zur Traumreise</h2>
      <ol>
        <li><strong>Inspirieren lassen:</strong> Wählen Sie Reisethema, Saison und Reisedauer.</li>
        <li><strong>Route zusammenstellen:</strong> Kombinieren Sie Orte, Aktivitäten und Unterkünfte.</li>
        <li><strong>Details klären:</strong> Prüfen Sie Visa, Transport und lokale Tipps.</li>
      </ol>
      <a class="link" href="/reiseplaner" aria-label="Zum Reiseplaner wechseln">Zum Reiseplaner</a>
    </section>
  `,
  styles: [
    `
      ol { padding-left: 1.25rem; }
      li { margin: .5rem 0; }
      .link:focus-visible { outline: 3px solid #ffb703; outline-offset: 3px; }
    `,
  ],
})
export class HomePlanningStepsComponent {}
