/**
 * Zeitkritische Reiseinformationen an einer Stelle. Bei Änderungen bitte nur
 * hier anpassen – Ratgeberseiten und Startseite übernehmen die Texte.
 *
 * Hochlandbahn nach dem Zyklon Ditwah: Sobald die durchgehende Strecke ab
 * Kandy wieder befahrbar ist (geplant: Ende 2026), Texte und Stand anpassen.
 */
export const RAILWAY_STATUS = {
  /** Wann der Stand zuletzt geprüft wurde. */
  checked: 'Ende Oktober 2026',

  /** Kurzantwort für die FAQ auf der Startseite. */
  faqAnswer:
    'Teilweise. Nach den Schäden durch den Zyklon Ditwah fahren die Züge zwischen Nanu Oya und Ella seit Juni 2026 wieder. ' +
    'Nördlich von Nanu Oya – also ab Kandy – ruht der Bahnverkehr noch; die durchgehende Strecke soll bis Ende 2026 wieder ' +
    'befahrbar sein (Stand: Ende Oktober 2026).',

  /** Hinweisbox auf den Ratgeberseiten „Unterwegs“ und „Hochland“. */
  noticeHtml: `
<aside class="callout callout--warning">
  <p><strong>Hochlandbahn nach dem Zyklon Ditwah (Stand: Ende Oktober 2026):</strong> Ende November 2025 hat der Zyklon die
  Bahnstrecke Colombo – Kandy – Badulla an mehr als 200 Stellen beschädigt. Seit dem 20. Juni 2026 fahren die Züge zwischen
  <strong>Nanu Oya und Badulla</strong> – also auch über Ella – wieder. Nördlich von Nanu Oya, also ab Colombo und Kandy, ruht der
  Bahnverkehr noch; die durchgehende Verbindung soll nach offiziellen Angaben bis Ende 2026 wiederhergestellt sein.</p>
  <p><strong>Vorsicht bei Online-Tickets:</strong> Manche Buchungsportale verkaufen noch Fahrten ab Kandy. Achten Sie darauf, dass
  Ihr Ticket ab Nanu Oya gilt, und prüfen Sie den aktuellen Stand kurz vor der Reise – etwa bei Ihrer Unterkunft, Ihrem Fahrer
  oder bei Sri Lanka Railways.</p>
  <p><strong>Unser Tipp:</strong> Fahren Sie mit dem Auto bis Nuwara Eliya und steigen Sie in Nanu Oya in den Zug nach Ella – das
  ist ohnehin der landschaftlich spektakulärste Teil der Strecke.</p>
</aside>`,

  /** Kurzer Hinweis auf den Routenseiten. */
  routeHintHtml: `
<aside class="callout">
  <p><strong>Hinweis zur Bahn (Stand: Ende Oktober 2026):</strong> Seit Juni 2026 fahren die Züge zwischen Nanu Oya und Ella
  wieder; ab Kandy ruht der Bahnverkehr noch. Deshalb führt diese Route mit dem Auto bis Nuwara Eliya. Mehr unter
  <a href="/reise-planen/transport">Unterwegs in Sri Lanka</a>.</p>
</aside>`
} as const;
