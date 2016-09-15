import {Component, Inject, 
  trigger, state, transition, animate, style, group} from '@angular/core';
import {LoadingIndicator} from './loading-indicator.component';
import {Samples} from './services/samples.service';

@Component({
  selector: 'igx-conf-2016',
  template: `
    <div (window:resize)="onWindowResize()">
      <span [hidden]="isLoading()" (click)="displayMenu = !displayMenu" style="cursor:pointer">{{menuAnchor}}</span>
      <nav [hidden]="isLoading()" [@showMenu]="displayMenu ? 'open': 'closed'">    
        <a routerLink="/ball" routerLinkActive="active">Bouncing Ball</a>
        <a routerLink="/tball" routerLinkActive="active">Bouncing Ball Reactive</a>
        <a routerLink="/pong" routerLinkActive="active">Pong</a>
        <a routerLink="/" routerLinkActive="active">Windchimes</a>
        <a routerLink="/play" routerLinkActive="active">Windchimes in Wind</a>
        <a routerLink="/visual" routerLinkActive="active">Visualizer</a>      
      </nav>
      <router-outlet [hidden]="isLoading()"></router-outlet>
      <loading-indicator *ngIf="isLoading()" [progress]="getLoadProgress()"></loading-indicator>
    </div>
  `,
  styles: [''],
  animations: [
    trigger('showMenu', [
      state('void', style({ height: 0, transform: "translate3d(-100% ,0 ,0)" })),
      state('closed', style({ height: 0, transform: "translate3d(-100% ,0 ,0)" })),
      state('open', style({ height: '*', transform: "translate3d(0 ,0 ,0)" })),
      transition('closed => open', [
        animate('700ms cubic-bezier(.6,.03,.21,1.35)  ')]),
      transition('open => closed', [animate('400ms ease-out')])
    ])
  ]
  // directives: [LoadingIndicator, ROUTER_DIRECTIVES]
})
export class AppComponent {

  displayMenu: boolean;

  get menuAnchor() {
    return this.displayMenu ? "<" : ">";
  }

  bufferLoaded = false;
  constructor( @Inject('size') private size, private samples: Samples) {
    this.onWindowResize();
    setTimeout(() => this.bufferLoaded = true, 4200);
  }
  onWindowResize() {
    this.size.width = window.innerWidth;
    this.size.height = window.innerHeight;
  }
  getLoadProgress() {
    const bfrCount = this.bufferLoaded ? 1 : 0;
    var p = 100 * (this.samples.loadedSampleCount + bfrCount) / (this.samples.totalSampleCount + 1);
    // console.info("Progress:" + p);
    return p;
  }
  isLoading() {
    return this.getLoadProgress() < 100;
  }
}
