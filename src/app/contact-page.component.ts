import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OFFICIAL_SOURCES } from './official-sources';
import { SeoService } from './seo.service';
import { SITE_OPERATOR } from './site-operator.config';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contact-page.component.html'
})
export class ContactPageComponent implements OnInit {
  readonly operator = SITE_OPERATOR;
  readonly sources = OFFICIAL_SOURCES;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: 'Kontakt',
      description: 'Fragen zur Sri-Lanka-Reise oder ein Hinweis auf veraltete Informationen? So erreichen Sie Entdecken Ceylon.'
    });
  }
}
