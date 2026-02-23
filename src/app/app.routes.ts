import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page.component';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { DynamicPageComponent } from './dynamic-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'datenschutz', component: PrivacyPolicyComponent },
  { path: ':slug', component: DynamicPageComponent },
  { path: ':category/:slug', component: DynamicPageComponent },
  { path: '**', redirectTo: '' }
];
