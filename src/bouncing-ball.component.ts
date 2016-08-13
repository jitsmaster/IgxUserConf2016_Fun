import {Component, Inject, Input, OnInit,
  ElementRef, Renderer, ViewChild,
  OnDestroy, trigger, transition, animate, style, group} from '@angular/core';
import {Samples} from './services/samples.service';
import {Audio} from './services/audio.service';

//g force
const G: number = 32 * 45;

@Component({
  selector: 'ball',
  styles: [require('./bouncing-ball.css').toString()],
  template: `
    <button (click)='bounce()'>Restart</button>
    <div class="ball" #ball></div>`,
  animations: [
  ]
})
export class BouncingBall {
  @ViewChild('ball') ballRef: ElementRef;

  ball: HTMLElement;

  screenPort: {
    w: number,
    h: number
  };

  constructor(private ele: ElementRef, private renderer: Renderer) {
  }

  _damp = 0.85;

  _getTimeForFallDistance(h: number) {
    return Math.sqrt(2 * h / G);
  }

  ngOnInit() {

    this.ball = this.ballRef.nativeElement;

    this.screenPort = {
      w: window.screen.height,
      h: window.screen.height * 0.9 - 50
    };

    this.bounce();
  }

  timer:NodeJS.Timer;

  bounce() {
    if (this.timer)
      clearTimeout(this.timer);

    var pos = {
      x: this.screenPort.w / 2,
      y: 0
    };

    this.renderer.setElementStyle(this.ball, "left", pos.x + "px");
    this.renderer.setElementStyle(this.ball, "top", pos.y + "px");

    var h = this.screenPort.h;

    var rising = false;
    if (h > 1) {
      this.timer = setTimeout(() => {
        this._bounceTrip(h, rising);
      }, 100);
    }
  }

  _bounceTrip(h: number, rising: boolean) {
    clearTimeout(this.timer);
    var t = this._getTimeForFallDistance(h);

    this.renderer.setElementClass(this.ball, "ballRising", rising);
    this.renderer.setElementStyle(this.ball, "transitionDuration", t + "s");
    this.renderer.setElementStyle(this.ball, "top", (rising) ? this.screenPort.h - h + "px" : this.screenPort.h + "px");

    h = h * this._damp;
    rising = !rising

    if (h > 1) {
      this.timer = setTimeout(() => {
        this._bounceTrip(h, rising);
      }, t * 1000);
    }
  }

  ngOnDestroy() {

  }
}
