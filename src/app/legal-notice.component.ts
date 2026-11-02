import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OFFICIAL_SOURCES } from './official-sources';
import { SeoService } from './seo.service';
import { SITE_OPERATOR } from './site-operator.config';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './legal-notice.component.html'
})
export class LegalNoticeComponent implements OnInit {
  readonly operator = SITE_OPERATOR;
  readonly foreignOfficeUrl = OFFICIAL_SOURCES.germany.url;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: 'Impressum',
      description: 'Anbieterkennzeichnung von Entdecken Ceylon gemäß § 5 DDG.'
    });
  }
}
