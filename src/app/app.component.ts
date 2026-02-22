import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isDarkTheme = false;

  readonly planningSteps = [
    { label: 'Beste Reisezeit', href: '/reise-planen/beste-reisezeit', icon: '☀️' },
    { label: 'Budget & Kosten', href: '/kosten/2-wochen-budget', icon: '💶' },
    { label: 'Sicherheit', href: '/sicherheit/ist-sri-lanka-sicher', icon: '🛡️' },
    { label: 'Transport', href: '/reise-planen/transport', icon: '🚆' },
    { label: 'Beispielrouten', href: '/routen', icon: '🗺️' }
  ];

  readonly guideCards = [
    {
      title: 'Beste Reisezeit für Sri Lanka',
      href: '/reise-planen/beste-reisezeit',
      label: 'Reiseplanung',
      image: '/assets/images/guide-best-time.svg'
    },
    {
      title: 'Sri Lanka Kosten für 2 Wochen',
      href: '/kosten/2-wochen-budget',
      label: 'Kosten',
      image: '/assets/images/guide-cost.svg'
    },
    {
      title: 'Ist Sri Lanka sicher?',
      href: '/sicherheit/ist-sri-lanka-sicher',
      label: 'Sicherheit',
      image: '/assets/images/guide-safety.svg'
    },
    {
      title: '10 Tage Route',
      href: '/routen/10-tage',
      label: 'Route',
      image: '/assets/images/guide-route-10.svg'
    },
    {
      title: 'Visum DE/AT/CH',
      href: '/reise-planen/visum-de-at-ch',
      label: 'Einreise',
      image: '/assets/images/guide-visa.svg'
    },
    {
      title: '14 Tage Route im Überblick',
      href: '/routen/14-tage',
      label: 'Empfehlung',
      image: '/assets/images/guide-route-14.svg'
    }
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly renderer: Renderer2,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnInit(): void {
    this.initializeTheme();
    const pageTitle = 'Sri Lanka entdecken – entspannt & gut vorbereitet reisen';
    const description =
      'Inspiration, Routen und praktische Tipps für Ihre Reiseplanung in Sri Lanka – ruhig, strukturiert und ohne Verkaufsdruck.';
    const pageUrl = 'https://entdecken-ceylon.de/';
    const socialImage = `${pageUrl}assets/images/hero-sri-lanka.svg`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large' });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.meta.updateTag({ property: 'og:image', content: socialImage });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: socialImage });

    this.injectJsonLd(pageTitle, description, pageUrl);
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkTheme);
    localStorage.setItem('entdecken-theme', this.isDarkTheme ? 'dark' : 'light');
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('entdecken-theme');
    const prefersDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    this.setTheme(shouldUseDark);
  }

  private setTheme(useDark: boolean): void {
    this.isDarkTheme = useDark;
    this.document.body.classList.toggle('theme-dark', this.isDarkTheme);
  }

  private injectJsonLd(pageTitle: string, description: string, pageUrl: string): void {
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${pageUrl}#website`,
          url: pageUrl,
          name: pageTitle,
          inLanguage: 'de',
          description
        },
        {
          '@type': 'TravelGuide',
          '@id': `${pageUrl}#travel-guide`,
          name: 'Entdecken Ceylon Reiseguide',
          about: 'Sri Lanka Reiseplanung',
          inLanguage: 'de',
          url: pageUrl,
          description
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Wann ist die beste Reisezeit für Sri Lanka?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Die optimale Reisezeit hängt von der Region ab. Der Südwesten ist meist von Dezember bis April ideal, der Osten von Mai bis September.'
              }
            },
            {
              '@type': 'Question',
              name: 'Wie viel Budget braucht man für 2 Wochen Sri Lanka?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Je nach Reisestil liegen viele Reisen zwischen 1.200 und 2.500 Euro pro Person inklusive Unterkünften, Transport und Aktivitäten.'
              }
            }
          ]
        }
      ]
    };

    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    this.renderer.appendChild(this.document.head, script);
  }
}
