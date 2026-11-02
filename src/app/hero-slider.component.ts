import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

export interface HeroSlide {
  src: string;
  alt: string;
}

/**
 * Vollflächiger Bild-Slider für den Seitenkopf. Der Textinhalt wird per
 * <ng-content> übergeben. Mit Pause-Schalter und ohne automatischen Wechsel
 * bei „prefers-reduced-motion“ (WCAG 2.2.2).
 */
@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-slider.component.html',
  styleUrl: './hero-slider.component.scss'
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  @Input({ required: true }) slides: HeroSlide[] = [];
  @Input() intervalMs = 5000;

  currentSlideIndex = 0;
  isAutoplayPaused = false;

  private sliderTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.isAutoplayPaused =
      typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    this.startSlider();
  }

  ngOnDestroy(): void {
    this.stopSlider();
  }

  previousSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
    this.restartSlider();
  }

  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    this.restartSlider();
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    this.restartSlider();
  }

  toggleAutoplay(): void {
    this.isAutoplayPaused = !this.isAutoplayPaused;
    this.restartSlider();
  }

  private startSlider(): void {
    if (this.isAutoplayPaused || this.slides.length < 2) {
      return;
    }

    this.sliderTimer = setInterval(() => {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    }, this.intervalMs);
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
