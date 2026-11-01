import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OFFICIAL_SOURCES } from './official-sources';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss'
})
export class SiteFooterComponent {
  @Output() readonly cookieSettings = new EventEmitter<void>();

  readonly currentYear = new Date().getFullYear();
  readonly foreignOfficeUrl = OFFICIAL_SOURCES.germany.url;

  readonly planningLinks = [
    { label: 'Beste Reisezeit', path: '/reise-planen/beste-reisezeit' },
    { label: 'Visum & Einreise', path: '/reise-planen/visum-de-at-ch' },
    { label: 'Kosten & Budget', path: '/kosten/2-wochen-budget' },
    { label: 'Unterwegs im Land', path: '/reise-planen/transport' },
    { label: 'Sicherheit & Gesundheit', path: '/sicherheit/ist-sri-lanka-sicher' }
  ];

  readonly discoverLinks = [
    { label: 'Sri Lanka in 10 Tagen', path: '/routen/10-tage' },
    { label: 'Sri Lanka in 14 Tagen', path: '/routen/14-tage' },
    { label: 'Regionen im Überblick', path: '/orte' }
  ];
}
