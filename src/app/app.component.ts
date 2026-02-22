import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
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
      image:
        'https://images.unsplash.com/photo-1531201890868-3f73f9a1700e?auto=format&fit=crop&w=800&q=70'
    },
    {
      title: 'Sri Lanka Kosten für 2 Wochen',
      href: '/kosten/2-wochen-budget',
      label: 'Kosten',
      image:
        'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=70'
    },
    {
      title: 'Ist Sri Lanka sicher?',
      href: '/sicherheit/ist-sri-lanka-sicher',
      label: 'Sicherheit',
      image:
        'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=800&q=70'
    },
    {
      title: '10 Tage Route',
      href: '/routen/10-tage',
      label: 'Route',
      image:
        'https://images.unsplash.com/photo-1586966120728-1cf611b8f8ba?auto=format&fit=crop&w=800&q=70'
    },
    {
      title: 'Visum DE/AT/CH',
      href: '/reise-planen/visum-de-at-ch',
      label: 'Einreise',
      image:
        'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=70'
    },
    {
      title: '14 Tage Route im Überblick',
      href: '/routen/14-tage',
      label: 'Empfehlung',
      image:
        'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=70'
    }
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Sri Lanka entdecken – entspannt & gut vorbereitet reisen';
    const description =
      'Inspiration, Routen und praktische Tipps für Ihre Reiseplanung in Sri Lanka – ruhig, strukturiert und ohne Verkaufsdruck.';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://entdecken-ceylon.de/' });
  }
}
