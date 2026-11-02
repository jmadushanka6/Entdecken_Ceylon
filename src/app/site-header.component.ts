import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription, filter } from 'rxjs';

interface NavItem {
  label: string;
  path: string;
  exact: boolean;
}

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss'
})
export class SiteHeaderComponent implements OnInit, OnDestroy {
  @Input() isDarkTheme = false;
  @Output() readonly themeToggle = new EventEmitter<void>();

  isMenuOpen = false;

  readonly navItems: NavItem[] = [
    { label: 'Reiseplanung', path: '/reise-planen', exact: true },
    { label: 'Reisezeit', path: '/reise-planen/beste-reisezeit', exact: true },
    { label: 'Routen', path: '/routen', exact: false },
    { label: 'Regionen', path: '/orte', exact: false },
    { label: 'Einreise', path: '/reise-planen/visum-de-at-ch', exact: true },
    { label: 'Kosten', path: '/kosten/2-wochen-budget', exact: true },
    { label: 'Sicherheit', path: '/sicherheit/ist-sri-lanka-sicher', exact: true }
  ];

  private navigationSubscription?: Subscription;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.navigationSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.closeMenu());
  }

  ngOnDestroy(): void {
    this.navigationSubscription?.unsubscribe();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
