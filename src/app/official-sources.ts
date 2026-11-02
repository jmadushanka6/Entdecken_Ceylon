/**
 * Offizielle Anlaufstellen, auf die Reisende aus Deutschland, Österreich und der
 * Schweiz für verbindliche Einreise- und Sicherheitsinformationen verwiesen werden.
 */
export interface OfficialSource {
  label: string;
  url: string;
}

export const OFFICIAL_SOURCES = {
  germany: {
    label: 'Auswärtiges Amt: Sri Lanka – Reise- und Sicherheitshinweise',
    url: 'https://www.auswaertiges-amt.de/de/service/laender/srilanka-node/srilankasicherheit-212254'
  },
  austria: {
    label: 'BMEIA: Reiseinformation Sri Lanka',
    url: 'https://www.bmeia.gv.at/reise-services/reiseinformation/land/sri-lanka'
  },
  switzerland: {
    label: 'EDA: Reisehinweise für Sri Lanka',
    url: 'https://www.eda.admin.ch/de/reisehinweise-fuer-sri-lanka'
  },
  eta: {
    label: 'Offizielles ETA-Portal der Einwanderungsbehörde Sri Lankas',
    url: 'https://eta.gov.lk/'
  },
  crisisList: {
    label: 'Krisenvorsorgeliste ELEFAND des Auswärtigen Amts',
    url: 'https://krisenvorsorgeliste.diplo.de/'
  },
  germanEmbassy: {
    label: 'Deutsche Botschaft Colombo',
    url: 'https://colombo.diplo.de/'
  }
} satisfies Record<string, OfficialSource>;
