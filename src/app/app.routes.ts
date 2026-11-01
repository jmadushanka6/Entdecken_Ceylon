import { Routes } from '@angular/router';
import { AdminPageComponent } from './admin-page.component';
import { ContactPageComponent } from './contact-page.component';
import { DynamicPageComponent } from './dynamic-page.component';
import { HomePageComponent } from './home-page.component';
import { LegalNoticeComponent } from './legal-notice.component';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { SitemapPageComponent } from './sitemap-page.component';

/** Fest verdrahtete Seiten; alle übrigen URLs werden über das CMS bzw. die Starterinhalte aufgelöst. */
export const STATIC_PAGE_PATHS = ['', 'datenschutz', 'impressum', 'kontakt', 'sitemap'] as const;

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'datenschutz', component: PrivacyPolicyComponent },
  { path: 'impressum', component: LegalNoticeComponent },
  { path: 'kontakt', component: ContactPageComponent },
  { path: 'sitemap', component: SitemapPageComponent },
  { path: 'admin', component: AdminPageComponent },
  { path: '**', component: DynamicPageComponent }
];
