import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page.component';
import { PrivacyPolicyComponent } from './privacy-policy.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'datenschutz', component: PrivacyPolicyComponent },
  { path: '**', redirectTo: '' }
];
