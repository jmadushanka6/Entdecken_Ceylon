/**
 * Angaben zum Betreiber – genutzt von Impressum (§ 5 DDG), Datenschutzerklärung
 * und Kontaktseite. Bitte nur hier pflegen.
 *
 * TODO(Betreiber): Vor der Veröffentlichung durch die echten Angaben ersetzen.
 * Die aktuellen Werte stammen aus der bisherigen Datenschutzerklärung und sind
 * Platzhalter (z. B. „Musterstraße“). Ein Impressum mit Platzhaltern erfüllt die
 * gesetzlichen Pflichten nicht und wirkt auf Besucher unseriös.
 */
export interface SiteOperator {
  /** Name bzw. Firma inkl. Rechtsform (bei Einzelpersonen: Vor- und Nachname). */
  name: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  /** Allgemeine Kontaktadresse (Impressum, Kontaktseite). */
  email: string;
  /** Kontaktadresse für Datenschutzanfragen. */
  privacyEmail: string;
  /** Optional – wird nur angezeigt, wenn gesetzt. */
  phone?: string;
  /** Vertretungsberechtigte Person(en), z. B. bei einer GmbH. Optional. */
  representedBy?: string;
  /** Verantwortlich für journalistisch-redaktionelle Inhalte (§ 18 Abs. 2 MStV). Optional. */
  editorialResponsible?: string;
  /** Umsatzsteuer-Identifikationsnummer nach § 27a UStG. Optional. */
  vatId?: string;
  /** Registereintrag, z. B. „Amtsgericht Berlin-Charlottenburg, HRB 12345“. Optional. */
  register?: string;
}

export const SITE_OPERATOR: SiteOperator = {
  name: 'Entdecken Ceylon Reiseguide',
  street: 'Musterstraße 12',
  postalCode: '10115',
  city: 'Berlin',
  country: 'Deutschland',
  email: 'datenschutz@entdecken-ceylon.de',
  privacyEmail: 'datenschutz@entdecken-ceylon.de'
};
