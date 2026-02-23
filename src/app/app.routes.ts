import { Routes } from '@angular/router';
import { AdminPageComponent } from './admin-page.component';
import { DynamicPageComponent } from './dynamic-page.component';
import { HomePageComponent } from './home-page.component';
import { PrivacyPolicyComponent } from './privacy-policy.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'datenschutz', component: PrivacyPolicyComponent },
  { path: 'admin/pages', component: AdminPageComponent },
  { path: ':slug', component: DynamicPageComponent },
  { path: '**', redirectTo: '' }
];
