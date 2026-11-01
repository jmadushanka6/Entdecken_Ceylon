import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from './content.service';
import { SeoService } from './seo.service';
import { SITE_OPERATOR } from './site-operator.config';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent implements OnInit {
  readonly consentDate = localStorage.getItem('entdecken-cookie-consent-date');
  readonly operator = SITE_OPERATOR;
  readonly usesRemoteContent: boolean;

  constructor(
    private readonly seo: SeoService,
    contentService: ContentService
  ) {
    this.usesRemoteContent = contentService.isRemoteContentEnabled();
  }

  ngOnInit(): void {
    this.seo.update({
      title: 'Datenschutz & Cookies',
      description: 'Welche Daten Entdecken Ceylon verarbeitet, auf welcher Rechtsgrundlage und welche Rechte Sie nach der DSGVO haben.'
    });
  }
}
