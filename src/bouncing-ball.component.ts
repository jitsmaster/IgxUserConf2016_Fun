import {Component, Inject, Input, OnInit,
  ElementRef, Renderer, ViewChild,
  OnDestroy, trigger, transition, animate, style, group} from '@angular/core';
import {Samples} from './services/samples.service';
import {Audio} from './services/audio.service';

//g force
const G: number = 32 * 90;

@Component({
  selector: 'ball',
  styles: [require('./bouncing-ball.css').toString()],
  template: `
    <button (click)='bounce()'>Restart</button>
    <div class="ballTube" #ballTube>
      <div class="ball" #ball>
        <div class="ballShape" #ballSqueeze></div>
      </div>
    </div>
  `,
  animations: [
  ]
})
export class BouncingBall {
  @ViewChild('ball') ballRef: ElementRef;
  @ViewChild('ballTube') ballTubeRef: ElementRef;
  @ViewChild('ballSqueeze') ballSqueezeRef: ElementRef;

  ball: HTMLElement;
  ballTube: HTMLElement;
  ballSqueeze: HTMLElement;

  screenPort: {
    w: number,
    h: number
  };

  constructor(private ele: ElementRef, private renderer: Renderer,
    private audio: Audio,
    private samples: Samples) {
  }

  _damp = 0.85;
  _speedX = 150; //pixels per second
  stopAudio: () => void; //end play function pointer

  _getTimeForFallDistance(h: number) {
    return Math.sqrt(2 * h / G);
  }

  ngOnInit() {

    this.ball = this.ballRef.nativeElement;
    this.ballTube = this.ballTubeRef.nativeElement;
    this.ballSqueeze = this.ballSqueezeRef.nativeElement;

    this.screenPort = {
      w: window.screen.width,
      h: window.screen.height * 0.9 - 100
    };

    this.bounce();
  }

  timer;

  bounce() {
    if (this.timer)
      clearTimeout(this.timer);

    var x = 0;
    this.renderer.setElementStyle(this.ballTube, "left", x + "px");
    var h = this.screenPort.h;
    this.renderer.setElementStyle(this.ball, "bottom", (h + 100) + "px");

    var rising = false;
    if (h > 1) {
      this.timer = setTimeout(() => {
        this._bounceTrip(h, x, rising);
      }, 100);
    }
  }

  _bounceTrip(h: number, x: number, rising: boolean) {
    if (this.timer)
      clearTimeout(this.timer);
    if (this.stopAudio && rising)
      this.stopAudio();

    var t = this._getTimeForFallDistance(h);

    x += this._speedX * t;

    this.renderer.setElementClass(this.ball, "ballRising", rising);
    this.renderer.setElementStyle(this.ball, "transitionDuration", t + "s");
    this.renderer.setElementStyle(this.ball, "bottom", (rising) ? (h + 100) + "px" : 100 + "px");

    this.renderer.setElementStyle(this.ballTube, "transitionDuration", t + "s");
    this.renderer.setElementStyle(this.ballTube, "left", x + "px");

    this.renderer.setElementClass(this.ballSqueeze, "ballShapeRising", rising);
    this.renderer.setElementStyle(this.ballSqueeze, "transitionDuration", t + "s");
    this.renderer.setElementStyle(this.ballSqueeze, "height", (rising) ? "40px" : "20px");

    //play sound when rising
    var pan = (x / this.screenPort.w) * 3 - 1;
    if (rising)
      this.samples.getSample("PINGPONG").then(sample => {
        this.stopAudio = this.audio.play(sample, (x / this.screenPort.w) * 3 - 1);
      });

    h = h * this._damp;
    rising = !rising

    if (h > 1) {
      this.timer = setTimeout(() => {
        this._bounceTrip(h, x, rising);
      }, t * 1000);
    }
    else {
      this.renderer.setElementStyle(this.ballSqueeze, "height", "40px");

    }
  }

  ngOnDestroy() {
    this.stopAudio();
  }
}
