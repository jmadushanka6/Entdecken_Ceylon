import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { DynamicPage, DynamicPageService } from './dynamic-page.service';

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dynamic-page.component.html',
  styleUrl: './dynamic-page.component.scss'
})
export class DynamicPageComponent implements OnInit {
  page?: DynamicPage;
  slug = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly dynamicPageService: DynamicPageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.slug = params.get('slug') ?? '';
      this.page = this.dynamicPageService.getPageBySlug(this.slug);

      if (this.page) {
        this.title.setTitle(`${this.page.title} | Entdecken Ceylon`);
      } else {
        this.title.setTitle('Seite nicht gefunden | Entdecken Ceylon');
      }
    });
  }
}
