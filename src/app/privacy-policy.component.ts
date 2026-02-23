import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent implements OnInit {
  consentDate = localStorage.getItem('entdecken-cookie-consent-date');

  constructor(private readonly title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Datenschutz & Cookies | Entdecken Ceylon');
  }
}
