import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      seo: {
        title: 'Entdecken Ceylon | Calm Premium Travel Magazine',
        description:
          'Explore Sri Lanka through calm, premium stories with curated routes, heritage stays, and mindful coastal escapes.',
        ogImage:
          'https://images.unsplash.com/photo-1586500036706-41963de24d8b?auto=format&fit=crop&w=1600&q=80'
      }
    }
  }
];
