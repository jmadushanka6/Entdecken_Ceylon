import type { ContentPage } from './content.service';
import { OFFICIAL_SOURCES } from './official-sources';
import { RAILWAY_STATUS } from './travel-status';

/**
 * Redaktionelle Starterinhalte für Reisende aus Deutschland, Österreich und der
 * Schweiz. Sie decken alle URLs ab, auf die Startseite, Navigation und Footer
 * verlinken. Über /admin lässt sich jede Seite durch eine CMS-Seite mit gleicher
 * URI ersetzen.
 *
 * Zeitkritische Angaben (Einreise, Bahnstrecken, Sicherheit) bitte regelmäßig
 * prüfen und danach `lastReviewed` aktualisieren – der Wert wird als „Stand“
 * angezeigt.
 */

const REVIEWED = '2026-11-01';

const externalLink = (url: string, label: string): string =>
  `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;

const AA = (label = 'Reise- und Sicherheitshinweise des Auswärtigen Amts'): string =>
  externalLink(OFFICIAL_SOURCES.germany.url, label);
const BMEIA = (label = 'BMEIA'): string => externalLink(OFFICIAL_SOURCES.austria.url, label);
const EDA = (label = 'EDA'): string => externalLink(OFFICIAL_SOURCES.switzerland.url, label);
const ETA = (label = 'eta.gov.lk'): string => externalLink(OFFICIAL_SOURCES.eta.url, label);
const ELEFAND = (label = 'Krisenvorsorgeliste ELEFAND'): string => externalLink(OFFICIAL_SOURCES.crisisList.url, label);

// ---------------------------------------------------------------------------
// Reisezeit-Kalender
// ---------------------------------------------------------------------------
type Season = 'ideal' | 'good' | 'mixed' | 'rain';

const SEASON_LABEL: Record<Season, string> = {
  ideal: 'Ideal',
  good: 'Gut',
  mixed: 'Wechselhaft',
  rain: 'Regenzeit'
};

const SEASON_CLASS: Record<Season, string> = {
  ideal: 's-ideal',
  good: 's-good',
  mixed: 's-mixed',
  rain: 's-rain'
};

/** Monat · Westküste & Süden · Hochland · Kulturdreieck · Ostküste */
const SEASON_CALENDAR: ReadonlyArray<readonly [string, Season, Season, Season, Season]> = [
  ['Januar', 'ideal', 'good', 'good', 'rain'],
  ['Februar', 'ideal', 'ideal', 'ideal', 'mixed'],
  ['März', 'ideal', 'ideal', 'ideal', 'good'],
  ['April', 'good', 'good', 'good', 'good'],
  ['Mai', 'rain', 'mixed', 'good', 'ideal'],
  ['Juni', 'rain', 'mixed', 'ideal', 'ideal'],
  ['Juli', 'mixed', 'mixed', 'ideal', 'ideal'],
  ['August', 'mixed', 'mixed', 'ideal', 'ideal'],
  ['September', 'mixed', 'mixed', 'good', 'good'],
  ['Oktober', 'rain', 'rain', 'mixed', 'mixed'],
  ['November', 'mixed', 'rain', 'rain', 'rain'],
  ['Dezember', 'good', 'mixed', 'mixed', 'rain']
];

const seasonCell = (season: Season): string =>
  `<td class="${SEASON_CLASS[season]}">${SEASON_LABEL[season]}</td>`;

const seasonTable = `
<div class="table-scroll">
  <table class="season-table">
    <caption>Reisezeit nach Regionen – Monat für Monat</caption>
    <thead>
      <tr>
        <th scope="col">Monat</th>
        <th scope="col">Westküste &amp; Süden</th>
        <th scope="col">Hochland</th>
        <th scope="col">Kulturdreieck</th>
        <th scope="col">Ostküste</th>
      </tr>
    </thead>
    <tbody>
      ${SEASON_CALENDAR.map(
        ([month, west, hills, culture, east]) =>
          `<tr><th scope="row">${month}</th>${[west, hills, culture, east].map(seasonCell).join('')}</tr>`
      ).join('\n      ')}
    </tbody>
  </table>
</div>
<ul class="legend" aria-label="Legende">
  <li><span class="s-ideal" aria-hidden="true"></span>Ideal – trocken, ruhiges Meer</li>
  <li><span class="s-good" aria-hidden="true"></span>Gut – überwiegend sonnig, einzelne Schauer</li>
  <li><span class="s-mixed" aria-hidden="true"></span>Wechselhaft – häufiger Regen, aber gut bereisbar</li>
  <li><span class="s-rain" aria-hidden="true"></span>Regenzeit – viel Regen, oft raue See</li>
</ul>`;

// ---------------------------------------------------------------------------
// Wiederkehrende Bausteine
// ---------------------------------------------------------------------------
const officialSourcesList = `
<ul>
  <li>Deutschland: ${AA('Auswärtiges Amt – Sri Lanka: Reise- und Sicherheitshinweise')}</li>
  <li>Österreich: ${BMEIA('BMEIA – Reiseinformation Sri Lanka')}</li>
  <li>Schweiz: ${EDA('EDA – Reisehinweise für Sri Lanka')}</li>
  <li>Sri Lanka: ${ETA('Offizielles ETA-Portal (eta.gov.lk)')}</li>
</ul>`;

export const BUILT_IN_PAGES: ContentPage[] = [
  // -------------------------------------------------------------------------
  {
    uri: 'reise-planen',
    title: 'Sri-Lanka-Reise planen',
    description:
      'Reisezeit, Einreise, Budget und Transport: alles Wichtige für Ihre Sri-Lanka-Reise aus Deutschland, Österreich oder der Schweiz – kompakt zusammengefasst.',
    heroImageUrl: '/assets/images/hero-sri-lanka.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<h2>In fünf Schritten zur Reise</h2>
<div class="card-links">
  <a href="/reise-planen/beste-reisezeit"><strong>1. Reisezeit wählen</strong><span>Zwei Monsune, zwei Hauptsaisons: Wann sich welche Region lohnt.</span></a>
  <a href="/routen"><strong>2. Route festlegen</strong><span>Für die erste Reise sind 14 Tage ideal, in 10 Tagen schaffen Sie die Höhepunkte.</span></a>
  <a href="/reise-planen/visum-de-at-ch"><strong>3. Einreise klären</strong><span>Die ETA muss vor dem Abflug online beantragt werden – für DE, AT und CH gebührenfrei.</span></a>
  <a href="/kosten/2-wochen-budget"><strong>4. Budget planen</strong><span>Richtwerte für Flug, Unterkünfte, Fahrer und Eintritte.</span></a>
  <a href="/reise-planen/transport"><strong>5. Fortbewegung organisieren</strong><span>Fahrer, Zug, Bus oder Tuk-Tuk – und der Stand der Hochlandbahn.</span></a>
</div>

<h2>Sri Lanka auf einen Blick</h2>
<dl class="facts">
  <div><dt>Zeitverschiebung</dt><dd>+4,5 Stunden im deutschen Winter, +3,5 Stunden im Sommer. Sri Lanka stellt nicht auf Sommerzeit um.</dd></div>
  <div><dt>Flugzeit</dt><dd>Meist mit einem Umstieg, insgesamt etwa 12–16 Stunden.</dd></div>
  <div><dt>Einreise</dt><dd>Reisepass (mind. 6 Monate gültig) und ETA, vor Abflug online beantragt.</dd></div>
  <div><dt>Währung</dt><dd>Sri-Lanka-Rupie (LKR). Geld am Automaten mit Visa- oder Mastercard – die Girocard allein reicht nicht.</dd></div>
  <div><dt>Strom</dt><dd>230 Volt, Steckdosen meist Typ D und G: Reiseadapter einpacken.</dd></div>
  <div><dt>Sprache</dt><dd>Singhalesisch und Tamil; im Tourismus wird fast überall Englisch gesprochen.</dd></div>
  <div><dt>Verkehr</dt><dd>Linksverkehr. Die meisten Reisenden sind mit Fahrer, Zug oder Tuk-Tuk unterwegs.</dd></div>
  <div><dt>Größe</dt><dd>Rund 65.600 km² – etwas kleiner als Bayern, aber mit langen Fahrzeiten.</dd></div>
</dl>

<h2>Checkliste vor der Abreise</h2>
<ul class="checklist">
  <li>Reisepass, der bei der Einreise noch mindestens sechs Monate gültig ist (ein Personalausweis reicht nicht)</li>
  <li>ETA über die offizielle Seite ${ETA()} beantragt, Bestätigung gespeichert und ausgedruckt</li>
  <li>Rück- oder Weiterflugticket</li>
  <li>Auslandsreisekrankenversicherung inklusive Rücktransport – die gesetzliche Krankenversicherung zahlt in Sri Lanka nicht</li>
  <li>Reisemedizinische Beratung etwa sechs bis acht Wochen vor Abflug</li>
  <li>Visa- oder Mastercard, am besten zwei Karten verschiedener Anbieter</li>
  <li>Reiseadapter (Typ G/D), Mückenschutz, Sonnenschutz und leichte, lange Kleidung für Tempelbesuche</li>
  <li>Deutsche Staatsangehörige: Eintrag in die ${ELEFAND()}</li>
  <li>Kurz vor der Abreise noch einmal die ${AA()} prüfen</li>
</ul>

<h2>Weitere Themen</h2>
<div class="card-links">
  <a href="/sicherheit/ist-sri-lanka-sicher"><strong>Ist Sri Lanka sicher?</strong><span>Verkehr, Baden, Gesundheit und Notrufnummern.</span></a>
  <a href="/orte"><strong>Regionen im Überblick</strong><span>Kulturdreieck, Hochland, Westküste &amp; Süden, Ostküste.</span></a>
</div>`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'reise-planen/beste-reisezeit',
    title: 'Beste Reisezeit für Sri Lanka',
    description:
      'Zwei Monsune, zwei Hauptsaisons: Wann sich Westküste, Süden, Hochland, Kulturdreieck und Ostküste lohnen – mit Monatsübersicht und Tipps für die Ferienzeiten.',
    heroImageUrl: '/assets/images/guide-best-time.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<p>Sri Lanka ist ein Ganzjahresziel – nur nicht überall gleichzeitig. Zwei Monsune bestimmen das Wetter:</p>
<ul>
  <li><strong>Südwestmonsun (etwa Mai bis September):</strong> Regen vor allem an der Westküste, im Süden und an der Westseite des Hochlands. Die Ostküste ist dann meist trocken und sonnig.</li>
  <li><strong>Nordostmonsun (etwa November bis Februar):</strong> Regen vor allem im Norden und Osten. Westküste und Süden haben jetzt Hochsaison.</li>
  <li><strong>Zwischenmonsun (etwa April sowie Oktober/November):</strong> landesweit häufig kräftige Schauer und Gewitter, meist am Nachmittag.</li>
</ul>
<p>An der Küste ist es das ganze Jahr über tropisch warm, tagsüber meist 28–32&nbsp;°C. Im Hochland um Nuwara Eliya (rund 1.900 m) wird es nachts deutlich kühler, von Dezember bis Februar teils unter 10&nbsp;°C – eine warme Jacke gehört ins Gepäck.</p>

<h2>Monatsübersicht</h2>
${seasonTable}
<p class="small">Die Übersicht zeigt typische Verhältnisse. Das Wetter schwankt von Jahr zu Jahr; auch in der Regenzeit gibt es viele sonnige Stunden.</p>

<h2>Reisezeit nach Ferienzeiten</h2>
<ul>
  <li><strong>Weihnachten bis Ostern (Dezember–April):</strong> Hauptsaison an der Westküste und im Süden, gut kombinierbar mit Kulturdreieck und Hochland. Unterkünfte über Weihnachten, Neujahr und im Februar frühzeitig buchen.</li>
  <li><strong>Pfingst- und Sommerferien (Juni–August):</strong> beste Zeit für die <a href="/orte/ostkueste">Ostküste</a> und das <a href="/orte/kultur-dreieck">Kulturdreieck</a>; das Hochland ist wechselhaft, aber gut bereisbar. Im Süden herrscht Monsun mit rauer See – Baden ist dort oft gefährlich.</li>
  <li><strong>Herbstferien (Oktober/November):</strong> Zwischenmonsun mit vielen Schauern. Dafür ist es ruhiger und günstiger.</li>
</ul>

<h2>Feste und Feiertage</h2>
<ul>
  <li><strong>Poya-Tage:</strong> Jeder Vollmond ist Feiertag. Alkohol wird nicht verkauft, viele Geschäfte schließen und Tempel sind besonders voll.</li>
  <li><strong>Singhalesisch-tamilisches Neujahr (Mitte April):</strong> Viele Betriebe schließen für einige Tage, Busse und Züge sind voll.</li>
  <li><strong>Vesak (Vollmond im Mai):</strong> Das wichtigste buddhistische Fest – Straßen und Tempel werden mit Laternen geschmückt.</li>
  <li><strong>Esala Perahera in Kandy (Juli/August):</strong> prachtvolle Prozessionen über mehrere Nächte. Unterkünfte in Kandy sind lange im Voraus ausgebucht und deutlich teurer.</li>
</ul>

<h2>Natur und Tierbeobachtung</h2>
<ul>
  <li><strong>Walbeobachtung vor Mirissa:</strong> etwa Dezember bis April.</li>
  <li><strong>Elefanten in Minneriya und Kaudulla:</strong> besonders viele Tiere etwa von Juli bis September.</li>
  <li><strong>Yala-Nationalpark:</strong> wird in der Regel im September/Oktober für einige Wochen geschlossen.</li>
  <li><strong>Adam's Peak:</strong> Pilgersaison mit beleuchtetem Aufstieg etwa von Dezember bis April/Mai.</li>
  <li><strong>Surfen in Arugam Bay:</strong> Saison etwa von April bis Oktober.</li>
</ul>`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'reise-planen/visum-de-at-ch',
    title: 'Visum & Einreise für Sri Lanka',
    description:
      'ETA vor dem Abflug online beantragen – für Staatsangehörige aus Deutschland, Österreich und der Schweiz seit 25. Mai 2026 gebührenfrei. Dokumente, Ablauf und offizielle Quellen.',
    heroImageUrl: '/assets/images/guide-visa.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<aside class="callout">
  <p><strong>Das Wichtigste in Kürze:</strong> Für einen Urlaub in Sri Lanka brauchen Sie eine elektronische Reisegenehmigung
  (Electronic Travel Authorization, ETA), die Sie <strong>vor dem Abflug online</strong> beantragen. Für Staatsangehörige aus
  Deutschland, Österreich und der Schweiz ist die Touristen-ETA seit dem <strong>25. Mai 2026 gebührenfrei</strong> – zuvor kostete
  sie 50 US-Dollar.</p>
</aside>

<h2>Welche Dokumente brauche ich?</h2>
<ul>
  <li><strong>Reisepass,</strong> der bei der Einreise noch mindestens sechs Monate gültig ist. Ein Personalausweis reicht nicht.</li>
  <li><strong>ETA für touristische Aufenthalte,</strong> vor Reiseantritt beantragt. Seit Oktober 2025 muss sie bereits vor der Ankunft vorliegen – verlassen Sie sich nicht auf eine Erteilung am Flughafen. Ohne ETA kann die Fluggesellschaft die Beförderung verweigern.</li>
  <li><strong>Rück- oder Weiterflugticket</strong> und auf Nachfrage ausreichende Mittel für den Aufenthalt.</li>
  <li><strong>Kinder</strong> benötigen ein eigenes Reisedokument und eine eigene ETA.</li>
</ul>

<h2>ETA beantragen – Schritt für Schritt</h2>
<ol>
  <li>Öffnen Sie die offizielle Seite ${ETA()} der Einwanderungsbehörde Sri Lankas.</li>
  <li>Wählen Sie die ETA für touristische Aufenthalte und übertragen Sie Ihre Passdaten exakt wie im Pass.</li>
  <li>Halten Sie Reisedaten, die Adresse Ihrer ersten Unterkunft und eine E-Mail-Adresse bereit.</li>
  <li>Die Bestätigung kommt per E-Mail, oft schon nach wenigen Stunden. Planen Sie trotzdem einige Tage Puffer ein, speichern Sie die Bestätigung und nehmen Sie einen Ausdruck mit.</li>
</ol>

<aside class="callout callout--warning">
  <p><strong>Vorsicht vor inoffiziellen Anbietern:</strong> Zahlreiche Websites wirken amtlich, verlangen aber Servicegebühren für
  einen Antrag, der für Sie kostenlos ist. Beantragen Sie die ETA direkt über ${ETA()}.</p>
</aside>

<h2>Aufenthaltsdauer und Verlängerung</h2>
<p>Die gebührenfreie Touristen-ETA gilt für Aufenthalte von bis zu 30 Tagen ab der ersten Einreise. Wer länger bleiben möchte,
kann vor Ort bei der Einwanderungsbehörde eine kostenpflichtige Verlängerung beantragen. Zur Zahl der erlaubten Einreisen gibt
es unterschiedliche Angaben – wichtig, wenn Sie zwischendurch etwa auf die Malediven fliegen. Maßgeblich ist der Bescheid, den Sie
erhalten.</p>
<p>Für Geschäftsreisen und andere Aufenthaltszwecke gelten eigene ETA-Kategorien und Gebühren.</p>

<h2>Offizielle Quellen</h2>
${officialSourcesList}
<p class="small">Einreisebestimmungen können sich kurzfristig ändern. Verbindlich sind allein die Angaben der zuständigen Behörden.</p>`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'reise-planen/transport',
    title: 'Unterwegs in Sri Lanka',
    description:
      'Mit Fahrer, Zug, Bus oder Tuk-Tuk? Vor- und Nachteile, typische Fahrzeiten und der aktuelle Stand der Hochlandbahn nach dem Zyklon Ditwah.',
    heroImageUrl: '/assets/images/guide-transport.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<p>Die Entfernungen wirken klein, die Fahrzeiten sind es nicht: Für 100 Kilometer brauchen Sie auf vielen Strecken zwei bis drei
Stunden. Planen Sie deshalb lieber weniger Stationen ein.</p>

<h2>Mit Fahrer – die beliebteste Variante</h2>
<p>Ein Wagen mit Fahrer ist für viele Reisende die bequemste Lösung: flexible Stopps, kein Gepäckschleppen und jemand, der Straßen
und Gepflogenheiten kennt. Auch das Auswärtige Amt empfiehlt für Überlandfahrten Zug oder Mietwagen mit Fahrer. Achten Sie bei der
Buchung auf:</p>
<ul>
  <li>einen von der Tourismusbehörde SLTDA lizenzierten Fahrer bzw. Chauffeur-Guide,</li>
  <li>einen klar vereinbarten Preis inklusive Kraftstoff, Maut, Parkgebühren sowie Unterkunft und Verpflegung des Fahrers,</li>
  <li>ein Fahrzeug mit funktionierender Klimaanlage und Sicherheitsgurten auch auf der Rückbank,</li>
  <li>deutschsprachige Fahrer-Guides: Es gibt sie, sie sind aber gefragt und etwas teurer – frühzeitig anfragen.</li>
</ul>
<p>Gewürzgärten, Edelsteinläden und Batikmanufakturen zahlen Fahrern oft Provision. Sagen Sie vorab, wenn Sie keine Verkaufsstopps
möchten – das ist völlig üblich.</p>

<h2>Zug – langsam, günstig, spektakulär</h2>
<p>Die Bahnfahrt durch das Hochland gehört zu den schönsten der Welt. Reservierte Plätze in der 1. und 2. Klasse sind auf beliebten
Strecken oft Wochen im Voraus ausgebucht. Unreservierte Tickets gibt es am Bahnhof – dann aber häufig im Stehen.</p>
${RAILWAY_STATUS.noticeHtml}

<h2>Bus – für Sparfüchse</h2>
<p>Überlandbusse sind sehr günstig und fahren häufig, sind aber oft voll und werden zügig gefahren. Klimatisierte Expressbusse
verbinden größere Städte, etwa über die Autobahn von Colombo nach Galle und Matara.</p>

<h2>Tuk-Tuk und Fahrdienst-Apps</h2>
<p>Für kurze Strecken sind Tuk-Tuks ideal. In Colombo und größeren Orten funktionieren Apps wie PickMe und Uber mit Festpreisen.
Ansonsten den Preis vor Fahrtbeginn vereinbaren oder auf das Taxameter bestehen.</p>

<h2>Selbst fahren?</h2>
<p>Für einen Mietwagen ohne Fahrer brauchen Sie neben dem Internationalen Führerschein eine in Sri Lanka ausgestellte Genehmigung.
Wegen des dichten, oft chaotischen Verkehrs rät das Auswärtige Amt davon ab. Auch Rollerfahren ist nur für sehr erfahrene Fahrer
zu empfehlen.</p>

<h2>Typische Fahrzeiten mit dem Auto</h2>
<div class="table-scroll">
  <table>
    <caption>Richtwerte ohne längere Pausen</caption>
    <thead><tr><th scope="col">Strecke</th><th scope="col">Fahrzeit</th></tr></thead>
    <tbody>
      <tr><th scope="row">Flughafen Colombo – Sigiriya</th><td>ca. 4 Std.</td></tr>
      <tr><th scope="row">Sigiriya – Kandy</th><td>ca. 2,5–3 Std.</td></tr>
      <tr><th scope="row">Kandy – Nuwara Eliya</th><td>ca. 3 Std.</td></tr>
      <tr><th scope="row">Nuwara Eliya – Ella</th><td>ca. 2,5 Std. (Zug ab Nanu Oya ca. 3 Std.)</td></tr>
      <tr><th scope="row">Ella – Tissamaharama (Yala)</th><td>ca. 2,5 Std.</td></tr>
      <tr><th scope="row">Tissamaharama – Mirissa</th><td>ca. 2 Std.</td></tr>
      <tr><th scope="row">Mirissa – Galle</th><td>ca. 1 Std.</td></tr>
      <tr><th scope="row">Galle – Flughafen Colombo</th><td>ca. 2,5 Std. über die Autobahn</td></tr>
    </tbody>
  </table>
</div>`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'kosten/2-wochen-budget',
    title: 'Was kosten zwei Wochen Sri Lanka?',
    description:
      'Realistische Richtwerte für Flug, Unterkünfte, Fahrer, Eintritte und Essen – für drei Reisestile, mit Tipps zu Geld, Karten und Trinkgeld.',
    heroImageUrl: '/assets/images/guide-cost.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<p>Sri Lanka ist günstiger als viele Fernreiseziele, aber nicht mehr billig: Eintritte für ausländische Gäste und Unterkünfte in der
Hochsaison haben angezogen. Die folgenden Richtwerte gelten <strong>pro Person bei zwei Reisenden im Doppelzimmer</strong> und
<strong>ohne internationalen Flug</strong>.</p>

<div class="table-scroll">
  <table>
    <caption>Richtwerte für 14 Tage vor Ort</caption>
    <thead>
      <tr><th scope="col">Posten</th><th scope="col">Einfach</th><th scope="col">Komfortabel</th><th scope="col">Gehoben</th></tr>
    </thead>
    <tbody>
      <tr><th scope="row">Unterkunft (13 Nächte)</th><td>150–300 €</td><td>400–900 €</td><td>ab 1.000 €</td></tr>
      <tr><th scope="row">Transport</th><td>50–120 € (Zug, Bus, Tuk-Tuk)</td><td>300–500 € (Fahrer, geteilt)</td><td>500–800 € (Fahrer-Guide)</td></tr>
      <tr><th scope="row">Essen &amp; Getränke</th><td>150–250 €</td><td>250–400 €</td><td>ab 450 €</td></tr>
      <tr><th scope="row">Eintritte &amp; Safaris</th><td>150–300 €</td><td>200–350 €</td><td>250–400 €</td></tr>
    </tbody>
    <tfoot>
      <tr><th scope="row">Summe vor Ort</th><td>ca. 500–900 €</td><td>ca. 1.200–2.200 €</td><td>ab ca. 2.200 €</td></tr>
    </tfoot>
  </table>
</div>

<p><strong>Dazu kommt der Flug:</strong> Hin- und Rückflug in der Economy kosten je nach Saison und Buchungszeitpunkt etwa
700–1.200 €, über Weihnachten und Neujahr auch mehr. Für zwei Wochen inklusive Flug planen viele Reisende also zwischen
1.200 € (einfach) und 3.400 € (komfortabel) pro Person.</p>

<h2>Wo das Geld hingeht</h2>
<ul>
  <li><strong>Eintritte:</strong> Für Ausländer gelten eigene Preise, an großen Stätten wie Sigiriya, Polonnaruwa oder Anuradhapura jeweils etwa 25–40 US-Dollar.</li>
  <li><strong>Safaris:</strong> Parkeintritt plus Jeep – ein halber Tag in Yala oder Udawalawe kostet pro Person schnell 50–80 €.</li>
  <li><strong>Fahrer:</strong> Der Tagespreis wird pro Fahrzeug berechnet; zu zweit oder zu viert sinken die Kosten pro Person deutlich.</li>
  <li><strong>Essen:</strong> Reis und Curry im einfachen Lokal kostet wenige Euro, in Hotelrestaurants zahlen Sie europäische Preise.</li>
</ul>

<h2>Geld und Bezahlen</h2>
<ul>
  <li>Landeswährung ist die Sri-Lanka-Rupie (LKR). Der Kurs schwankt – rechnen Sie mit dem aktuellen Wechselkurs.</li>
  <li><strong>Girocard:</strong> Für Geldautomaten und Kartenzahlung brauchen Sie eine Visa- oder Mastercard (Kredit- oder Debitkarte). Nehmen Sie am besten zwei Karten verschiedener Anbieter mit und bewahren Sie sie getrennt auf.</li>
  <li>Geldautomaten gibt es in allen größeren Orten; die örtliche Bank berechnet meist eine Gebühr pro Abhebung.</li>
  <li>Für Tuk-Tuks, Märkte, Tempelspenden und kleine Lokale brauchen Sie Bargeld, möglichst in kleinen Scheinen.</li>
  <li>Euro-Bargeld lässt sich am Flughafen und in Banken problemlos tauschen.</li>
</ul>

<h2>Trinkgeld</h2>
<p>In Restaurants steht häufig bereits eine Servicegebühr von 10&nbsp;% auf der Rechnung. Fahrer und Guides freuen sich über ein
Trinkgeld; für Fahrer sind etwa 5–10 € pro Tag für die gesamte Reisegruppe ein gängiger Richtwert.</p>

<h2>Spartipps</h2>
<ul>
  <li>Reisen in der Nebensaison und Unterkünfte direkt anfragen.</li>
  <li>Teilstrecken mit Zug oder Bus statt mit dem Fahrer zurücklegen.</li>
  <li>Eine Trinkflasche mit Filter spart Geld und Plastikmüll.</li>
  <li>Lieber weniger Eintritte, dafür die richtigen: Sigiriya können Sie zum Beispiel auch vom günstigeren Pidurangala-Felsen aus bestaunen.</li>
</ul>
<p class="small">Alle Beträge sind gerundete Richtwerte ohne Gewähr. Preise ändern sich mit Saison, Wechselkurs und Anbieter.</p>`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'sicherheit/ist-sri-lanka-sicher',
    title: 'Ist Sri Lanka sicher?',
    description:
      'Verkehr, Baden, Betrugsmaschen, Gesundheit und Notrufnummern: realistische Sicherheitstipps und offizielle Anlaufstellen für Ihre Sri-Lanka-Reise.',
    heroImageUrl: '/assets/images/guide-safety.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<p>Kurz gesagt: Sri Lanka ist ein gut bereisbares Land. Die meisten Probleme entstehen nicht durch Kriminalität, sondern durch
Straßenverkehr, Meer, Hitze und kleine Betrugsmaschen. Mit etwas Vorbereitung reisen Sie entspannt.</p>

<aside class="callout">
  <p><strong>Vor und während der Reise:</strong> Prüfen Sie die aktuellen ${AA()} – bzw. die Hinweise des ${BMEIA()} oder des
  ${EDA()}. Deutsche Staatsangehörige können sich kostenlos in die ${ELEFAND()} eintragen und werden dann im Krisenfall informiert.</p>
</aside>

<h2>Straßenverkehr – das größte Risiko</h2>
<p>Es herrscht Linksverkehr, Busse überholen riskant, und nachts sind Fußgänger, Hunde und Wildtiere schlecht zu sehen. Das
Auswärtige Amt rät vom Selbstfahren ab. Die meisten Reisenden nutzen einen Wagen mit ortskundigem Fahrer, den Zug oder Tuk-Tuks.
Lange Etappen sollten Sie tagsüber fahren.</p>

<h2>Baden und Meer</h2>
<p>Während des Monsuns gibt es gefährliche Strömungen und hohe Brandung – an der Westküste und im Süden vor allem etwa von Mai bis
September, an der Ostküste etwa von November bis Februar. Baden Sie nur an Stellen, die Einheimische empfehlen, achten Sie auf
rote Flaggen und gehen Sie nie allein oder nach Alkoholgenuss ins Wasser.</p>

<h2>Betrugsmaschen und Kleinkriminalität</h2>
<ul>
  <li><strong>„Heute geschlossen“:</strong> Freundliche Helfer behaupten, Tempel, Hotel oder Bahnhof seien geschlossen, und bieten eine Alternative an – meist mit Provision.</li>
  <li><strong>Edelsteine:</strong> Angebliche Schnäppchen zum Weiterverkaufen in Europa sind fast immer überteuert oder gefälscht.</li>
  <li><strong>Tuk-Tuk-Preise:</strong> Fahrpreis vorher vereinbaren oder Taxameter bzw. Apps wie PickMe und Uber nutzen.</li>
  <li><strong>Taschendiebstahl:</strong> In vollen Zügen, Bussen und auf Märkten Wertsachen körpernah tragen.</li>
</ul>

<h2>Respekt vor Religion und Gesetzen</h2>
<ul>
  <li>Tempel nur mit bedeckten Schultern und Knien betreten, Schuhe und Kopfbedeckung ablegen.</li>
  <li>Buddha-Statuen nicht berühren und nicht mit dem Rücken zu ihnen posieren. Buddhistische Motive als Tattoo oder auf Kleidung können zu Einreiseverweigerung oder Ausweisung führen.</li>
  <li>Militär, Polizei und Sicherheitsbereiche nicht fotografieren. Drohnen nur mit Genehmigung fliegen.</li>
  <li>Drogendelikte werden auch bei kleinen Mengen sehr streng bestraft.</li>
  <li>Gleichgeschlechtliche Handlungen sind gesetzlich verboten; Zurückhaltung in der Öffentlichkeit ist ratsam.</li>
</ul>

<h2>Allein reisende Frauen</h2>
<p>Viele Frauen reisen problemlos allein. Belästigungen – etwa anzügliche Bemerkungen oder Annäherungen in vollen Bussen – kommen
jedoch vor. Hilfreich sind Kleidung, die Schultern und Knie bedeckt, ein Platz neben anderen Frauen in Bus und Bahn sowie Abstand zu
einsamen Stränden nach Einbruch der Dunkelheit.</p>

<h2>Natur und Wetter</h2>
<ul>
  <li>Starke Monsunregen können Überschwemmungen und Erdrutsche auslösen, besonders im Hochland. Nach dem Zyklon Ditwah (Ende November 2025) sind einzelne Straßen und Bahnabschnitte noch eingeschränkt.</li>
  <li>Sri Lanka liegt in einer Region, in der Tsunamis möglich sind. Informieren Sie sich in Strandunterkünften über Evakuierungswege.</li>
  <li>Wilde Elefanten queren vor allem im Osten und im Kulturdreieck die Straßen. Abstand halten, Tiere nie füttern.</li>
  <li>Im Norden und Osten können noch Minen und Blindgänger aus dem Bürgerkrieg liegen – bleiben Sie dort auf befestigten Wegen.</li>
</ul>

<h2>Gesundheit und Versicherung</h2>
<ul>
  <li><strong>Auslandsreisekrankenversicherung:</strong> unbedingt abschließen, inklusive Rücktransport. Die gesetzliche Krankenversicherung aus Deutschland und Österreich übernimmt in Sri Lanka keine Kosten; die Schweizer Grundversicherung nur begrenzt. Privatkliniken verlangen oft eine Kostenzusage oder Vorkasse.</li>
  <li><strong>Impfungen:</strong> Lassen Sie sich etwa sechs bis acht Wochen vor der Abreise reisemedizinisch beraten. Üblich ist ein Check der Standardimpfungen; häufig empfohlen wird zudem Hepatitis A, je nach Reiseart weitere.</li>
  <li><strong>Mückenschutz:</strong> Sri Lanka gilt seit 2016 als malariafrei, Dengue-Fieber tritt aber regelmäßig auf. Schützen Sie sich auch tagsüber konsequent.</li>
  <li><strong>Hitze und Wasser:</strong> viel trinken, Sonnenschutz nutzen, mittags Pausen einplanen. Leitungswasser nicht trinken.</li>
  <li><strong>Versorgung:</strong> In Colombo gibt es gute Privatkliniken, auf dem Land ist die medizinische Versorgung eingeschränkt.</li>
</ul>

<h2>Notrufnummern und Hilfe</h2>
<ul>
  <li>Polizei-Notruf: <strong>119</strong></li>
  <li>Rettungsdienst (Suwa Seriya, kostenlos): <strong>1990</strong></li>
  <li>In den Touristenorten an der Südwestküste gibt es Stationen der Touristenpolizei.</li>
  <li>Deutsche Botschaft Colombo: ${externalLink(OFFICIAL_SOURCES.germanEmbassy.url, 'colombo.diplo.de')}</li>
  <li>Österreich und Schweiz: Kontaktdaten der zuständigen Vertretungen beim ${BMEIA()} bzw. ${EDA()}</li>
</ul>`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'routen',
    title: 'Routen für Sri Lanka',
    description:
      'Bewährte Rundreisen für 10 und 14 Tage – mit realistischen Fahrzeiten, sinnvollen Übernachtungsorten und Varianten für die Sommermonate.',
    heroImageUrl: '/assets/images/route.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<p>Die klassische Rundreise führt vom Flughafen ins Kulturdreieck, weiter ins Hochland und zum Abschluss an die Strände im Süden.
So beginnen Sie mit Kultur und enden mit Erholung – ideal nach dem Langstreckenflug und vor dem Rückflug.</p>

<div class="card-links">
  <a href="/routen/10-tage"><strong>Sri Lanka in 10 Tagen</strong><span>Kulturdreieck, Kandy, Hochland und Südküste – kompakt, aber ohne Hetze.</span></a>
  <a href="/routen/14-tage"><strong>Sri Lanka in 14 Tagen</strong><span>Unsere Empfehlung für die erste Reise: mehr Zeit für Safari und Strand.</span></a>
</div>

<h2>Faustregeln für die Planung</h2>
<ul>
  <li>Pro Ort mindestens zwei Nächte – sonst sitzen Sie mehr im Auto als vor Ort.</li>
  <li>Höchstens drei bis vier Stunden Fahrzeit pro Etappe einplanen.</li>
  <li>Von Dezember bis April passt die klassische Route mit Südküste. Von Mai bis September tauschen Sie die Südküste gegen die <a href="/orte/ostkueste">Ostküste</a>.</li>
  <li>Geht der Rückflug nachts oder sehr früh, verbringen Sie die letzte Nacht in Flughafennähe in Negombo.</li>
  <li>Die Hochlandbahn ist nach dem Zyklon Ditwah noch nicht durchgehend befahrbar – Details unter <a href="/reise-planen/transport">Unterwegs in Sri Lanka</a>.</li>
</ul>`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'routen/10-tage',
    title: 'Sri Lanka in 10 Tagen',
    description:
      'Kompakte Rundreise für die Hauptsaison: Kulturdreieck, Kandy, Hochland und Südküste – Tag für Tag mit realistischen Fahrzeiten.',
    heroImageUrl: '/assets/images/guide-route-10.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<dl class="facts">
  <div><dt>Für wen?</dt><dd>Erstbesucher mit begrenztem Urlaub, die die Höhepunkte sehen möchten.</dd></div>
  <div><dt>Beste Reisezeit</dt><dd>Dezember bis April</dd></div>
  <div><dt>Unterwegs</dt><dd>Mit Fahrer, ergänzt um die Zugfahrt Nanu Oya – Ella.</dd></div>
</dl>

<h2>Der Ablauf</h2>
<ol class="itinerary">
  <li><strong>Tag 1: Ankunft in Negombo</strong>Ausruhen nach dem Flug, abends ein Spaziergang am Strand oder an der Lagune.</li>
  <li><strong>Tag 2–3: Sigiriya und Dambulla</strong>Fahrt ca. 4 Std. Löwenfelsen früh am Morgen, Höhlentempel von Dambulla, optional Jeep-Safari in Minneriya oder Kaudulla.</li>
  <li><strong>Tag 4: Kandy</strong>Fahrt ca. 3 Std. Zahntempel, Kandy-See und der Botanische Garten in Peradeniya.</li>
  <li><strong>Tag 5: Nuwara Eliya</strong>Fahrt ca. 3 Std. durch die Teeberge, unterwegs Besuch einer Teefabrik.</li>
  <li><strong>Tag 6–7: Ella</strong>Zugfahrt von Nanu Oya nach Ella (ca. 3 Std.). Wanderung auf den Little Adam's Peak, Nine Arches Bridge, für Trittsichere der Ella Rock.</li>
  <li><strong>Tag 8–9: Südküste</strong>Fahrt ca. 4 Std. Baden und Entspannen in Mirissa, Weligama oder Tangalle.</li>
  <li><strong>Tag 10: Galle und Abreise</strong>Spaziergang durch das Fort von Galle, dann über die Autobahn zum Flughafen (ca. 2,5 Std.).</li>
</ol>

${RAILWAY_STATUS.routeHintHtml}

<h2>Was wir bewusst weglassen</h2>
<p>Für Yala, Anuradhapura oder die Ostküste reichen zehn Tage kaum. Wer Safari und mehr Strandzeit möchte, wählt besser die
<a href="/routen/14-tage">14-Tage-Route</a>.</p>`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'routen/14-tage',
    title: 'Sri Lanka in 14 Tagen',
    description:
      'Unsere empfohlene Route für die erste Reise: Kulturdreieck, Kandy, Hochland, Safari im Süden und Erholung an der Küste – mit Sommervariante.',
    heroImageUrl: '/assets/images/guide-route-14.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<dl class="facts">
  <div><dt>Für wen?</dt><dd>Die ausgewogene Rundreise für den ersten Besuch – Kultur, Natur und Strand ohne Hetze.</dd></div>
  <div><dt>Beste Reisezeit</dt><dd>Dezember bis April (Sommervariante siehe unten)</dd></div>
  <div><dt>Unterwegs</dt><dd>Mit Fahrer, ergänzt um die Zugfahrt Nanu Oya – Ella.</dd></div>
</dl>

<h2>Der Ablauf</h2>
<ol class="itinerary">
  <li><strong>Tag 1: Ankunft in Negombo</strong>Ankommen und ausruhen in einer ruhigen Unterkunft nahe dem Flughafen.</li>
  <li><strong>Tag 2–4: Kulturdreieck</strong>Standort Sigiriya oder Habarana. Löwenfelsen oder Pidurangala zum Sonnenaufgang, Höhlentempel von Dambulla, Radtour durch die Ruinenstadt Polonnaruwa, nachmittags Jeep-Safari in Minneriya oder Kaudulla.</li>
  <li><strong>Tag 5–6: Kandy</strong>Zahntempel, Botanischer Garten Peradeniya und abends eine Vorführung der traditionellen Kandy-Tänze.</li>
  <li><strong>Tag 7: Nuwara Eliya</strong>Teeplantagen, Besuch einer Teefabrik und koloniales Flair in „Little England“.</li>
  <li><strong>Tag 8–9: Ella</strong>Morgens Zugfahrt von Nanu Oya nach Ella, danach Wanderungen zum Little Adam's Peak und zur Nine Arches Bridge. Alternativ: früh am Morgen zu den Horton Plains (World's End) und anschließend mit dem Auto nach Ella.</li>
  <li><strong>Tag 10: Safari in Yala oder Udawalawe</strong>Leoparden im Yala-Nationalpark oder Elefanten in Udawalawe; Übernachtung in Tissamaharama bzw. Udawalawe.</li>
  <li><strong>Tag 11–13: Südküste</strong>Baden und Entspannen in Mirissa, Weligama oder Tangalle. Von Dezember bis April sind Walbeobachtungen möglich.</li>
  <li><strong>Tag 14: Galle und Abreise</strong>Spaziergang durch das Fort von Galle (UNESCO-Welterbe), dann über die Autobahn zum Flughafen.</li>
</ol>
${RAILWAY_STATUS.routeHintHtml}

<aside class="callout">
  <p><strong>Sommervariante (Mai bis September):</strong> Tauschen Sie die Südküste gegen die Ostküste. Nach dem Kulturdreieck
  folgen drei Nächte in Trincomalee oder Pasikudah (ca. 2,5 Std. ab Sigiriya), danach Kandy und das Hochland. Von Ella geht es in
  ca. 6 Std. zurück zum Flughafen – oder Sie legen einen Zwischenstopp ein.</p>
</aside>

<h2>Mehr Zeit?</h2>
<p>Ergänzen Sie die alte Königsstadt Anuradhapura, den nächtlichen Aufstieg auf den Adam's Peak (Pilgersaison etwa Dezember bis
April/Mai) oder ein paar ruhige Tage an der <a href="/orte/ostkueste">Ostküste</a>.</p>`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'orte',
    title: 'Regionen Sri Lankas',
    description:
      'Kulturdreieck, Hochland, Westküste & Süden und Ostküste: Was die Regionen auszeichnet und wann sie sich am meisten lohnen.',
    heroImageUrl: '/assets/images/regions.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<p>Sri Lanka ist etwas kleiner als Bayern und doch erstaunlich vielfältig: Königsstädte und Felsentempel im trockenen Norden, kühle
Teeberge im Zentrum, Palmenstrände an den Küsten. Weil die Monsune die Insel zu unterschiedlichen Zeiten treffen, hat fast immer
irgendwo Saison.</p>

<div class="card-links">
  <a href="/orte/kultur-dreieck"><strong>Kulturdreieck</strong><span>Königsstädte, Höhlentempel und der Löwenfelsen Sigiriya. Beste Zeit: Februar bis September.</span></a>
  <a href="/orte/hochland"><strong>Hochland &amp; Teeberge</strong><span>Kandy, Nuwara Eliya und Ella: Teeplantagen, Wasserfälle, Wanderungen. Beste Zeit: Januar bis April.</span></a>
  <a href="/orte/westen-sueden"><strong>Westküste &amp; Süden</strong><span>Galle, Mirissa, Tangalle: Strände, Kolonialflair und Wale. Beste Zeit: Dezember bis April.</span></a>
  <a href="/orte/ostkueste"><strong>Ostküste</strong><span>Trincomalee, Pasikudah, Arugam Bay: ruhige Buchten und Surfen. Beste Zeit: Mai bis September.</span></a>
</div>

<p>Der tamilisch geprägte Norden um Jaffna ist touristisch noch wenig erschlossen – ein lohnendes Ziel für die zweite Reise.
Wann welche Region ideal ist, zeigt unsere <a href="/reise-planen/beste-reisezeit">Monatsübersicht zur Reisezeit</a>.</p>`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'orte/kultur-dreieck',
    title: 'Kulturdreieck',
    description:
      'Sigiriya, Dambulla, Polonnaruwa und Anuradhapura: Sri Lankas Königsstädte und Felsentempel – mit Tipps zu Tageszeiten, Kleidung und Safaris.',
    heroImageUrl: '/assets/images/culture.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<p>Zwischen Anuradhapura, Polonnaruwa und Kandy liegt das Kulturdreieck mit gleich mehreren UNESCO-Welterbestätten. Die meisten
Reisenden wohnen zentral in Sigiriya, Habarana oder Dambulla und erkunden die Region in Tagesausflügen.</p>

<h2>Höhepunkte</h2>
<ul>
  <li><strong>Sigiriya (Löwenfelsen):</strong> Felsenfestung aus dem 5. Jahrhundert mit Fresken und Wassergärten. Starten Sie früh – ab dem späten Vormittag wird es heiß und voll. Rund 1.200 Stufen, nichts bei starker Höhenangst.</li>
  <li><strong>Pidurangala:</strong> günstige Alternative mit Blick auf Sigiriya; kurze Kletterpassage am Ende, schön zum Sonnenaufgang.</li>
  <li><strong>Höhlentempel von Dambulla:</strong> fünf Höhlen mit über 150 Buddha-Statuen und farbenprächtigen Wandmalereien.</li>
  <li><strong>Polonnaruwa:</strong> mittelalterliche Königsstadt, am schönsten mit dem Fahrrad. Höhepunkt sind die Felsskulpturen von Gal Vihara.</li>
  <li><strong>Anuradhapura:</strong> erste Königsstadt mit riesigen Dagobas und dem heiligen Bodhi-Baum – lohnt sich, wenn Sie mehr Zeit haben.</li>
  <li><strong>Elefanten-Safari:</strong> in den Nationalparks Minneriya und Kaudulla oder im Hurulu Eco Park, besonders eindrucksvoll etwa von Juli bis September.</li>
</ul>

<h2>Praktische Tipps</h2>
<ul>
  <li>Tempel nur mit bedeckten Schultern und Knien besuchen, Schuhe ausziehen. Socken schützen vor heißen Steinböden.</li>
  <li>Für ausländische Gäste gelten eigene Eintrittspreise, meist in US-Dollar angegeben. Nehmen Sie Bargeld und Karte mit.</li>
  <li>Viel Wasser, Sonnenhut und Sonnencreme einpacken und mittags eine Pause einplanen.</li>
  <li>Seriöse Safari-Anbieter halten Abstand zu den Tieren. Elefantenreiten und Tiershows sollten Sie meiden.</li>
</ul>`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'orte/hochland',
    title: 'Hochland & Teeberge',
    description:
      'Kandy, Nuwara Eliya, Ella und die Horton Plains: Teeplantagen, Wasserfälle, Wanderungen und die berühmte Bahnstrecke – mit aktuellem Hinweis nach dem Zyklon Ditwah.',
    heroImageUrl: '/assets/images/highlands.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<p>Im Hochland wird es grün und angenehm kühl. Teeplantagen ziehen sich über steile Hänge, Wasserfälle stürzen ins Tal, und auf
über 2.000 Metern liegt die Hochebene der Horton Plains.</p>

<h2>Orte und Ausflüge</h2>
<ul>
  <li><strong>Kandy:</strong> letzte Königsstadt und kulturelles Zentrum mit dem Zahntempel (Sri Dalada Maligawa), dem Kandy-See und dem Botanischen Garten in Peradeniya. Im Juli/August findet die Esala Perahera statt.</li>
  <li><strong>Nuwara Eliya:</strong> „Little England“ auf rund 1.900 Metern – Kolonialbauten, Teefabriken mit Führungen und kühle Nächte.</li>
  <li><strong>Horton Plains:</strong> Nationalpark mit dem Rundweg zum World's End (rund 9 km). Starten Sie früh, denn ab dem späten Vormittag ziehen oft Wolken auf.</li>
  <li><strong>Ella:</strong> entspanntes Bergdorf mit Wanderungen zum Little Adam's Peak und auf den Ella Rock sowie der Nine Arches Bridge.</li>
  <li><strong>Adam's Peak (Sri Pada):</strong> heiliger Berg, der nachts für den Sonnenaufgang bestiegen wird – über 5.000 Stufen. Pilgersaison etwa Dezember bis April/Mai.</li>
</ul>

<h2>Gut zu wissen</h2>
<ul>
  <li>In Nuwara Eliya und auf den Horton Plains kann es nachts unter 10&nbsp;°C kalt werden – Fleecejacke einpacken.</li>
  <li>Nachmittags regnet es im Hochland häufig. Wanderungen am besten morgens unternehmen.</li>
  <li>Bei einer Führung durch eine Teefabrik erfahren Sie, wie Ceylon-Tee verarbeitet wird, und können direkt vor Ort kaufen.</li>
</ul>
${RAILWAY_STATUS.noticeHtml}`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'orte/westen-sueden',
    title: 'Westküste & Süden',
    description:
      'Von Negombo über Galle bis Tangalle: Strände, Kolonialstädte, Walbeobachtung und Safaris – mit Tipps zur besten Reisezeit und zu verantwortungsvollem Reisen.',
    heroImageUrl: '/assets/images/beach.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<p>Von Dezember bis April zeigt sich die Westküste mit dem Süden von ihrer Sonnenseite: ruhiges Meer, lange Strände und Unterkünfte in
jeder Preisklasse. Von Mai bis September bringt der Südwestmonsun dagegen Regen und hohe Wellen.</p>

<h2>Orte entlang der Küste</h2>
<ul>
  <li><strong>Negombo:</strong> nahe dem Flughafen – praktisch für die erste und die letzte Nacht.</li>
  <li><strong>Colombo:</strong> lebendige Hauptstadt mit den Märkten im Viertel Pettah, der Promenade Galle Face Green und guten Restaurants. Ein Tag reicht für einen ersten Eindruck.</li>
  <li><strong>Bentota und Beruwala:</strong> breite Strände und Resorthotels; Bootsfahrten auf dem Madu Ganga.</li>
  <li><strong>Galle:</strong> das von den Niederländern ausgebaute Fort (UNESCO-Welterbe) mit Cafés, Galerien und einem Abendspaziergang auf der Festungsmauer.</li>
  <li><strong>Unawatuna, Weligama und Mirissa:</strong> beliebte Badeorte. Weligama eignet sich für Surfanfänger, Mirissa ist für Walbeobachtungen bekannt (etwa Dezember bis April).</li>
  <li><strong>Tangalle:</strong> ruhigere, weitläufige Buchten – gut zur Erholung am Reiseende.</li>
  <li><strong>Yala und Udawalawe:</strong> Nationalparks im Südosten; Yala ist für Leoparden bekannt, Udawalawe für Elefanten. Yala wird in der Regel im September/Oktober für einige Wochen geschlossen.</li>
</ul>

<h2>Verantwortungsvoll reisen</h2>
<ul>
  <li><strong>Walbeobachtung:</strong> Wählen Sie Anbieter, die Abstand zu den Tieren halten und die Tiere nicht verfolgen.</li>
  <li><strong>Meeresschildkröten:</strong> Besuchen Sie nur Stationen, die Tiere tatsächlich auswildern – keine, die Schildkröten dauerhaft in Becken halten.</li>
  <li><strong>Baden:</strong> Achten Sie auf Strömungen und Warnflaggen. Mehr dazu in unserem <a href="/sicherheit/ist-sri-lanka-sicher">Sicherheitsratgeber</a>.</li>
</ul>`
  },

  // -------------------------------------------------------------------------
  {
    uri: 'orte/ostkueste',
    title: 'Ostküste',
    description:
      'Trincomalee, Pasikudah und Arugam Bay: ruhige Buchten, Schnorcheln und Surfen – die beste Wahl für Reisen von Mai bis September und in den Sommerferien.',
    heroImageUrl: '/assets/images/east-coast.svg',
    customCss: '',
    lastReviewed: REVIEWED,
    bodyHtml: `
<p>Wenn an der Westküste der Monsun weht, zeigt sich die Ostküste von ihrer besten Seite. Von etwa Mai bis September ist das Meer
hier meist ruhig, das Wetter trocken und heiß – ideal für Reisen in den Pfingst- und Sommerferien.</p>

<h2>Orte</h2>
<ul>
  <li><strong>Trincomalee:</strong> Hafenstadt mit dem hinduistischen Felsentempel Koneswaram und den Stränden von Nilaveli und Uppuveli. Zum Schnorcheln und Tauchen geht es nach Pigeon Island.</li>
  <li><strong>Pasikudah:</strong> flache, sehr ruhige Bucht – gut geeignet für Familien mit Kindern.</li>
  <li><strong>Arugam Bay:</strong> Surfspot von internationalem Ruf mit entspannter Atmosphäre; die Saison läuft etwa von April bis Oktober.</li>
</ul>

<h2>Gut zu wissen</h2>
<ul>
  <li>Die Ostküste lässt sich gut mit dem Kulturdreieck kombinieren (Sigiriya – Trincomalee ca. 2,5 Std.).</li>
  <li>Von November bis Januar bringt der Nordostmonsun viel Regen; manche Unterkünfte schließen in dieser Zeit.</li>
  <li>Die Region ist tamilisch und muslimisch geprägt. Kleiden Sie sich abseits der Strände zurückhaltend.</li>
  <li>Prüfen Sie vor einer Reise nach Arugam Bay die aktuellen ${AA('Sicherheitshinweise')} – im Oktober 2024 gab es dort vorübergehend Terrorwarnungen.</li>
</ul>`
  }
];
