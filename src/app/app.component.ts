import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

type CookieConsentChoice = 'essential' | 'all';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isDarkTheme = false;
  showCookieBanner = false;
  consentChoice: CookieConsentChoice | null = null;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    this.initializeTheme();
    this.initializeCookieConsent();
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkTheme);
    localStorage.setItem('entdecken-theme', this.isDarkTheme ? 'dark' : 'light');
  }

  acceptEssentialCookies(): void {
    this.storeConsent('essential');
  }

  acceptAllCookies(): void {
    this.storeConsent('all');
  }

  openCookieSettings(): void {
    this.showCookieBanner = true;
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

  private initializeCookieConsent(): void {
    const storedValue = localStorage.getItem('entdecken-cookie-consent');

    if (!storedValue) {
      this.showCookieBanner = true;
      return;
    }

    this.consentChoice = storedValue === 'all' ? 'all' : 'essential';
    this.showCookieBanner = false;
  }

  private storeConsent(choice: CookieConsentChoice): void {
    this.consentChoice = choice;
    this.showCookieBanner = false;

    localStorage.setItem('entdecken-cookie-consent', choice);
    localStorage.setItem('entdecken-cookie-consent-date', new Date().toISOString());
  }
}
