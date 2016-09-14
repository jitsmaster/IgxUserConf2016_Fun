import { RouterModule, Routes } from '@angular/router';
import { Windchimes } from './windchimes.component';
import { WindchimesInteractive } from './windchimes-interactive.component';
import { Visualizer } from './visualizer.component';
import { BouncingBall } from './bouncing-ball.component';
import { BouncingBallTemplated } from './bouncing-balltemplated.component';
import {Pong} from './pong.component';

// export const routes: RouterConfig = [
//   {path: '', component: WindchimesInteractive},
//   {path: 'play', component: Windchimes},
//   {path: 'visual', component: Visualizer},
//   {path: 'ball', component: BouncingBall}
// ];

// export const APP_ROUTER_PROVIDERS = [
//   provideRouter(routes)
// ];


const appRoutes: Routes = [
  {path: '', component: WindchimesInteractive},
  {path: 'play', component: Windchimes},
  {path: 'visual', component: Visualizer},
  {path: 'ball', component: BouncingBall},
  {path: 'tball', component: BouncingBallTemplated},
  {path: 'pong', component: Pong}
];

export const appRoutingProviders: any[] = [
];

export const routing = RouterModule.forRoot(appRoutes);