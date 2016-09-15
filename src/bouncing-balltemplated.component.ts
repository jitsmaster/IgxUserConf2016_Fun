import {Component, Inject, Input, OnInit,
  ElementRef, Renderer, ViewChild,
  EventEmitter, ChangeDetectionStrategy,
  OnDestroy, trigger, state, transition, animate, style, group} from '@angular/core';
import {NgModel, ControlValueAccessor } from '@angular/forms';
import {Samples} from './services/samples.service';
import {Audio} from './services/audio.service';
import {Observable, BehaviorSubject} from 'rxjs/Rx';

//g force
const GForce: number = 32 * 90;
const BASESPEEDX: number = 100;

export class BounceModel { x: number; y: number; h: number; rising: boolean; t: string }

@Component({
  selector: 'ball-templated',
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
    <div class="ballTube" 
      [style.left.px]="(ballPosition | async).x"
      [style.transitionDuration]="(ballPosition | async).t">
      <div class="ball" 
        [style.bottom.px]="(ballPosition | async).y"
        [style.transitionDuration]="(ballPosition | async).t"
        [class.ballRising]="(ballPosition | async).rising">
        <div class="ballShape" 
          [class.ballShapeRising]="(ballPosition | async).rising"
          [style.transitionDuration]="(ballPosition | async).t"
          [style.height.px]="(ballPosition | async).h"></div>
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BouncingBallTemplated implements ControlValueAccessor {

  showAdvanced: boolean = false;

  private _ballPos = new BehaviorSubject<BounceModel>({
    x: 0,
    t: "",
    h: 0,
    rising: false,
    y: 0
  });

  ballPosition = this._ballPos.asObservable();

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
    return this._speedMultiplier * BASESPEEDX;
  } //pixels per second

  get _g() {
    return this._gMultiplier * GForce;
  }

  toggleAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  stopAudio: () => void; //end play function pointer

  _getTimeForFallDistance(h: number) {
    return Math.sqrt(2 * h / this._g);
  }

  ngOnInit() {

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
    var h = this.screenPort.h + 100;
    var rising = false

    this._ballPos.next({
      x: x,
      y: h,
      h: 40,
      rising: rising,
      t: '0s'
    });

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

    //play sound when rising
    var pan = (x / this.screenPort.w) * 3 - 1;
    if (rising)
      this.samples.getSample("PINGPONG").then(sample => {
        this.stopAudio = this.audio.play(sample, (x / this.screenPort.w) * 3 - 1);
      });

    h = h * this._damp;

    this._ballPos.next({
      x: Math.round(x),
      y: rising ? Math.round(h) + 100 : 100,
      h: rising ? 40 : 20,
      rising: rising,
      t: t + "s"
    });

    
    rising = !rising;

    if (h > 1) {
      this.timer = setTimeout(() => {
        this._bounceTrip(h, x, rising);
      }, t * 1000);
    }
    else {
      h = 100;
      rising = false;

      this._ballPos.next({
        x: Math.round(x),
        y: h,
        h: 40,
        rising: false,
        t: "0s"
      });
    }
  }

  ngOnDestroy() {
    if (this.stopAudio)
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
