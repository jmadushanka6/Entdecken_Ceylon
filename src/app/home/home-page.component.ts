import { Component } from '@angular/core';
import { HomeEditorialBlockComponent } from './home-editorial-block.component';
import { HomeFeaturedGuidesComponent } from './home-featured-guides.component';
import { HomeFeaturedRouteComponent } from './home-featured-route.component';
import { HomeHeroComponent } from './home-hero.component';
import { HomeLastUpdatedComponent } from './home-last-updated.component';
import { HomeMoodTilesComponent } from './home-mood-tiles.component';
import { HomePlanningStepsComponent } from './home-planning-steps.component';
import { SiteFooterComponent } from './site-footer.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HomeHeroComponent,
    HomeMoodTilesComponent,
    HomePlanningStepsComponent,
    HomeFeaturedRouteComponent,
    HomeEditorialBlockComponent,
    HomeFeaturedGuidesComponent,
    HomeLastUpdatedComponent,
    SiteFooterComponent,
  ],
  template: `
    <main class="home-page">
      <app-home-hero />
      <app-home-mood-tiles />
      <app-home-planning-steps />
      <app-home-featured-route />
      <app-home-editorial-block />
      <app-home-featured-guides />
      <app-home-last-updated />
      <app-site-footer />
    </main>
  `,
  styles: [
    `
      .home-page { max-width: 76rem; margin: 0 auto; padding: 1rem; display: grid; gap: 2rem; }
    `,
  ],
})
export class HomePageComponent {}
