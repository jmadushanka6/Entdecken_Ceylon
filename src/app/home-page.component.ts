import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroSlide, HeroSliderComponent } from './hero-slider.component';
import { SeoService } from './seo.service';
import { RAILWAY_STATUS } from './travel-status';

interface QuickFact {
  icon: string;
  label: string;
  value: string;
  href?: string;
}

interface Faq {
  question: string;
  answer: string;
  link?: { label: string; href: string };
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroSliderComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  readonly heroSlides: HeroSlide[] = [
    {
      src: '/assets/images/hero-sri-lanka.svg',
      alt: 'Illustration: Morgenstimmung über den Bergen Sri Lankas'
    },
    {
      src: '/assets/images/beach.svg',
      alt: 'Illustration: Palmen und Strand an der Südküste von Sri Lanka'
    },
    {
      src: '/assets/images/highlands.svg',
      alt: 'Illustration: Teeplantagen und Hügel im Hochland von Sri Lanka'
    }
  ];

  readonly moodTiles = [
    { label: 'Kultur & Geschichte', href: '/orte/kultur-dreieck', image: '/assets/images/culture.svg' },
    { label: 'Natur & Hochland', href: '/orte/hochland', image: '/assets/images/highlands.svg' },
    { label: 'Strände & Süden', href: '/orte/westen-sueden', image: '/assets/images/beach.svg' },
    { label: 'Ruhige Ostküste', href: '/orte/ostkueste', image: '/assets/images/east-coast.svg' }
  ];

  readonly planningSteps = [
    { label: 'Beste Reisezeit', href: '/reise-planen/beste-reisezeit', icon: '☀️' },
    { label: 'Einreise & ETA', href: '/reise-planen/visum-de-at-ch', icon: '🛂' },
    { label: 'Budget & Kosten', href: '/kosten/2-wochen-budget', icon: '💶' },
    { label: 'Sicherheit', href: '/sicherheit/ist-sri-lanka-sicher', icon: '🛡️' },
    { label: 'Transport', href: '/reise-planen/transport', icon: '🚆' },
    { label: 'Beispielrouten', href: '/routen', icon: '🗺️' }
  ];

  readonly quickFacts: QuickFact[] = [
    { icon: '🕓', label: 'Zeitverschiebung', value: '+4,5 Std. im Winter, +3,5 Std. im Sommer' },
    { icon: '✈️', label: 'Flugzeit', value: 'ca. 12–16 Std. mit einem Umstieg' },
    {
      icon: '🛂',
      label: 'Einreise',
      value: 'ETA vor Abflug online – für DE, AT und CH gebührenfrei',
      href: '/reise-planen/visum-de-at-ch'
    },
    {
      icon: '💳',
      label: 'Geld',
      value: 'Rupie (LKR); Visa- oder Mastercard statt Girocard',
      href: '/kosten/2-wochen-budget'
    },
    { icon: '🔌', label: 'Strom', value: '230 Volt, Reiseadapter Typ G/D einpacken' },
    {
      icon: '🩺',
      label: 'Gesundheit',
      value: 'Auslandskrankenversicherung abschließen',
      href: '/sicherheit/ist-sri-lanka-sicher'
    }
  ];

  readonly guideCards = [
    {
      title: 'Beste Reisezeit für Sri Lanka',
      href: '/reise-planen/beste-reisezeit',
      label: 'Reiseplanung',
      image: '/assets/images/guide-best-time.svg'
    },
    {
      title: 'Was kosten zwei Wochen Sri Lanka?',
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
      title: 'Die 10-Tage-Route',
      href: '/routen/10-tage',
      label: 'Route',
      image: '/assets/images/guide-route-10.svg'
    },
    {
      title: 'Visum & Einreise (DE/AT/CH)',
      href: '/reise-planen/visum-de-at-ch',
      label: 'Einreise',
      image: '/assets/images/guide-visa.svg'
    },
    {
      title: 'Die 14-Tage-Route im Überblick',
      href: '/routen/14-tage',
      label: 'Empfehlung',
      image: '/assets/images/guide-route-14.svg'
    }
  ];

  readonly faqs: Faq[] = [
    {
      question: 'Wann ist die beste Reisezeit für Sri Lanka?',
      answer:
        'Für die klassische Rundreise mit Westküste und Süden sind Dezember bis April ideal. Von Mai bis September ist die Ostküste die bessere Wahl – praktisch für die Sommerferien.',
      link: { label: 'Zur Monatsübersicht', href: '/reise-planen/beste-reisezeit' }
    },
    {
      question: 'Brauche ich ein Visum für Sri Lanka?',
      answer:
        'Ja. Sie benötigen eine elektronische Reisegenehmigung (ETA), die Sie vor dem Abflug online beantragen. Für Staatsangehörige aus Deutschland, Österreich und der Schweiz ist die Touristen-ETA seit dem 25. Mai 2026 gebührenfrei. Der Reisepass muss bei der Einreise noch mindestens sechs Monate gültig sein.',
      link: { label: 'Alles zur Einreise', href: '/reise-planen/visum-de-at-ch' }
    },
    {
      question: 'Wie viel Budget braucht man für zwei Wochen?',
      answer:
        'Vor Ort rechnen Sie pro Person mit etwa 500–900 € bei einfachem Reisestil und 1.200–2.200 € mit Fahrer und komfortablen Hotels. Hinzu kommt der Flug, je nach Saison etwa 700–1.200 €.',
      link: { label: 'Zur Kostenübersicht', href: '/kosten/2-wochen-budget' }
    },
    {
      question: 'Ist Sri Lanka sicher?',
      answer:
        'Für umsichtige Reisende ja. Die größten Risiken sind Straßenverkehr, starke Strömungen beim Baden und kleinere Betrugsmaschen. Prüfen Sie vor der Reise die aktuellen Hinweise des Auswärtigen Amts.',
      link: { label: 'Zum Sicherheitsratgeber', href: '/sicherheit/ist-sri-lanka-sicher' }
    },
    {
      question: 'Welche Versicherung und Impfungen brauche ich?',
      answer:
        'Schließen Sie unbedingt eine Auslandsreisekrankenversicherung ab – die gesetzliche Krankenversicherung zahlt in Sri Lanka nicht. Zu Impfungen lassen Sie sich reisemedizinisch beraten. Sri Lanka ist malariafrei, Mückenschutz gegen Dengue ist aber wichtig.',
      link: { label: 'Gesundheit & Sicherheit', href: '/sicherheit/ist-sri-lanka-sicher' }
    },
    {
      question: 'Wie groß ist die Zeitverschiebung?',
      answer:
        'Im deutschen Winter beträgt sie +4,5 Stunden, im Sommer +3,5 Stunden. Ist es in Frankfurt 12 Uhr, ist es in Colombo 16:30 Uhr (Winter) bzw. 15:30 Uhr (Sommer).'
    },
    {
      question: 'Kann ich mit der Girocard bezahlen?',
      answer:
        'In der Regel nicht. Nehmen Sie eine Visa- oder Mastercard (Kredit- oder Debitkarte) mit – am besten zwei Karten verschiedener Anbieter. Für Tuk-Tuks, Märkte und kleine Lokale brauchen Sie Bargeld in Rupien.'
    },
    {
      question: 'Fährt der Zug von Kandy nach Ella wieder?',
      answer: RAILWAY_STATUS.faqAnswer,
      link: { label: 'Aktueller Stand & Alternativen', href: '/reise-planen/transport' }
    }
  ];

  readonly travelNotices = [
    {
      date: '2026-11-01',
      text: 'Neue Ratgeber zu Reisezeit, Kosten, Sicherheit, Routen und Regionen',
      href: '/reise-planen'
    },
    {
      date: '2026-06-20',
      text: 'Hochlandbahn: Abschnitt Nanu Oya – Ella – Badulla wieder in Betrieb',
      href: '/reise-planen/transport'
    },
    {
      date: '2026-05-25',
      text: 'Touristen-ETA für Deutschland, Österreich und die Schweiz jetzt gebührenfrei',
      href: '/reise-planen/visum-de-at-ch'
    }
  ];

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: 'Sri Lanka entdecken – entspannt & gut vorbereitet reisen',
      description:
        'Inspiration, Routen und praktische Tipps für Ihre Reiseplanung in Sri Lanka – ruhig, strukturiert und ohne Verkaufsdruck.'
    });
  }
}
