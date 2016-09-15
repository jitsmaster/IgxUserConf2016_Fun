import {Component, Inject, Input, OnInit,
  ElementRef, Renderer, ViewChild,
  OnDestroy, trigger, state, transition, animate, style, group} from '@angular/core';
import {NgModel, ControlValueAccessor } from '@angular/forms';
import {Samples} from './services/samples.service';
import {Audio} from './services/audio.service';

//g force
const G: number = 32 * 90;
const SPEEDX: number = 100;

@Component({
  selector: 'ball',
  styles: [require('./bouncing-ball.css').toString()],
  template: `
    <button (click)='bounce()' class='btn btn-success'>Restart</button>
    <label>
      <input type='checkbox' (change)='toggleAdvanced()'/>  
      Advanced
    </label>
    <div [@configSlide]="showAdvanced ? 'open' : 'closed'">
      <span class='config'>
        Horizontal Speed:
        <select [(ngModel)]='_speedMultiplier'>
          <option value="1">1x</option>
          <option value="2">2x</option>
          <option value="3">3x</option>
          <option value="4">4x</option>
          <option value="5">5x</option>
        </select>
      </span>
      <span class='config'>
        gForce:
        <select [(ngModel)]='_gMultiplier'>
          <option value="0.25">0.25</option>
          <option value="0.5">0.5</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="4">4</option>
        </select>
      </span>  
      <span class='config'>
        Damp:
        <select [(ngModel)]='_damp'>
          <option value="0.5">0.5</option>
          <option value="0.6">0.6</option>
          <option value="0.7">0.7</option>
          <option value="0.8">0.8</option>
          <option value="0.9">0.9</option>
          <option value="1">1</option>
        </select>
      </span>    
    </div>
    <div class="ballTube" #ballTube>
      <div class="ball" #ball>
        <div class="ballShape" #ballSqueeze></div>
      </div>
    </div>
  `,
  animations: [
    trigger('configSlide', [
      state('void', style({ height: 0, transform: "translate3d(-100% ,0 ,0)" })),
      state('closed', style({ height: 0, transform: "translate3d(-100% ,0 ,0)" })),
      state('open', style({ height: '*', transform: "translate3d(0 ,0 ,0)" })),
      transition('closed => open', [
        animate('600ms cubic-bezier(0.3, 0, 0.1, 1.7)')]),
      transition('open => closed', [animate('400ms ease-out')])
    ])
  ]
})
export class BouncingBall implements ControlValueAccessor {
  @ViewChild('ball') ballRef: ElementRef;
  @ViewChild('ballTube') ballTubeRef: ElementRef;
  @ViewChild('ballSqueeze') ballSqueezeRef: ElementRef;

  ball: HTMLElement;
  ballTube: HTMLElement;
  ballSqueeze: HTMLElement;

  showAdvanced: boolean = false;

  screenPort: {
    w: number,
    h: number
  };

  constructor(private ele: ElementRef, private renderer: Renderer,
    private audio: Audio,
    private samples: Samples) {
  }

  _damp = 0.8;
  _speedMultiplier = 1;
  _gMultiplier = 1;

  get _speedX() {
    return this._speedMultiplier * SPEEDX;
  } //pixels per second

  get _g() {
    return this._gMultiplier * G;
  }

  toggleAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  stopAudio: () => void; //end play function pointer

  _getTimeForFallDistance(h: number) {
    return Math.sqrt(2 * h / this._g);
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
      this.renderer.setElementClass(this.ball, "ballRising", false);
    }
  }

  ngOnDestroy() {
    this.stopAudio();
  }

  writeValue(v: any): void {
    if (v == this._speedMultiplier)
      return;

    if (v && v instanceof String) {
      this._speedMultiplier = v;
      return;
    }

    this._speedMultiplier = v ? v : this._speedMultiplier;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public onChange: any = Function.prototype;
  public onTouched: any = Function.prototype;
}
