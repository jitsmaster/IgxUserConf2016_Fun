import { provideRouter, RouterConfig } from '@angular/router';
import { Windchimes } from './windchimes.component';
import { WindchimesInteractive } from './windchimes-interactive.component';
import { Visualizer } from './visualizer.component';
import { BouncingBall } from './bouncing-ball.component';

export const routes: RouterConfig = [
  {path: '', component: WindchimesInteractive},
  {path: 'play', component: Windchimes},
  {path: 'visual', component: Visualizer},
  {path: 'ball', component: BouncingBall}
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
