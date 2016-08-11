import {Component, Inject, Input, OnInit, OnDestroy, trigger, transition, animate, style, group} from '@angular/core';
import {Samples} from './services/samples.service';
import {Audio} from './services/audio.service';

@Component({
  selector: 'ball',
  template: `
  <div class="ball-wrapper">
    <div class="ball"></div>
    <div class="ball-shadow"></div>
  </div>
  `,
  styles: [require('./bouncing-ball.css').toString()],
  animations: [
  ]
})
export class BouncingBall implements OnInit, OnDestroy {

  constructor() {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }
}
