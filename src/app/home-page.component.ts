import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit, OnDestroy {
  currentSlideIndex = 0;
  private sliderTimer?: ReturnType<typeof setInterval>;

  readonly heroSlides = [
    {
      src: '/assets/images/hero-sri-lanka.svg',
      alt: 'Morgenstimmung über den Bergen Sri Lankas'
    },
    {
      src: '/assets/images/beach.svg',
      alt: 'Palmen und Strand an der Südküste von Sri Lanka'
    },
    {
      src: '/assets/images/highlands.svg',
      alt: 'Teeplantagen und Hügel im Hochland von Sri Lanka'
    }
  ];

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
    private readonly meta: Meta
  ) {}

  ngOnInit(): void {
    this.startSlider();

    this.title.setTitle('Sri Lanka entdecken – entspannt & gut vorbereitet reisen');
    this.meta.updateTag({
      name: 'description',
      content: 'Inspiration, Routen und praktische Tipps für Ihre Reiseplanung in Sri Lanka – ruhig, strukturiert und ohne Verkaufsdruck.'
    });
  }

  ngOnDestroy(): void {
    this.stopSlider();
  }

  previousSlide(): void {
    this.currentSlideIndex =
      (this.currentSlideIndex - 1 + this.heroSlides.length) % this.heroSlides.length;
    this.restartSlider();
  }

  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.heroSlides.length;
    this.restartSlider();
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    this.restartSlider();
  }

  private startSlider(): void {
    this.sliderTimer = setInterval(() => {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.heroSlides.length;
    }, 5000);
  }

  private stopSlider(): void {
    if (this.sliderTimer) {
      clearInterval(this.sliderTimer);
      this.sliderTimer = undefined;
    }
  }

  private restartSlider(): void {
    this.stopSlider();
    this.startSlider();
  }
}
