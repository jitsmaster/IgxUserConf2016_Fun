import { NgModule }       from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { RouterModule, RouterOutletMap, RouterLink, RouterLinkActive } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import {LoadingIndicator} from './loading-indicator.component';
import {Chime} from './chime.component';
import {Windchimes} from './windchimes.component';
import {WindchimesInteractive} from './windchimes-interactive.component';
import {BouncingBall} from './bouncing-ball.component';
import {BouncingBallTemplated} from './bouncing-balltemplated.component';
import {Visualizer} from './visualizer.component';
import {Pong} from './pong.component';
import {Random} from './services/random.service';
import {Samples} from './services/samples.service';
import {Spacial} from './services/spacial.service';
import {Audio} from './services/audio.service';
import {AppComponent}   from './app.component';
import {routing, appRoutingProviders} from './app.routes';
import {ForAnyOrder} from './directives/forAnyOrder.directive';

@NgModule({
    declarations: [AppComponent, Windchimes, WindchimesInteractive,
		BouncingBall, BouncingBallTemplated, Visualizer, LoadingIndicator,
		ForAnyOrder, Chime, Pong],
	exports: [AppComponent, Windchimes, WindchimesInteractive,
		BouncingBall, BouncingBallTemplated, Visualizer, LoadingIndicator,
		ForAnyOrder, Chime, Pong],
    imports: [BrowserModule, FormsModule, RouterModule, routing],
    bootstrap: [AppComponent],
	providers: [
		appRoutingProviders,
		Random,
		Spacial,
		Samples,
		Audio,
		{
			provide: APP_BASE_HREF,
			useValue: '/'
		},
		{
			provide: LocationStrategy,
			useClass: HashLocationStrategy
		},
		{
			provide: 'audioContext',
			useValue: new (window['AudioContext'] || window['webkitAudioContext'])
		},
		{
			provide: 'size', useValue: { width: 1280, height: 780 }
		},
		{
			provide: 'notes',
			useValue: ['C4', 'G4', 'C5', 'D5', 'E5']
		}
	]
})
export class AppModule { }