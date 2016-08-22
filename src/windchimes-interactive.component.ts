import {Component, Inject, HostListener, EventEmitter} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Random} from './services/random.service';
import {Spacial} from './services/spacial.service';
import {Samples} from './services/samples.service';
import {Audio} from './services/audio.service';

@Component({
  selector: 'windchimes-interactive',
  template: `
    <div class="muted-indicator" *ngIf="muted"></div>
    <div class="hint click-hint" *ngIf="!clicked && !isDone()">click anywhere</div>
    <div class="hint touch-hint" *ngIf="!clicked && !isDone()">touch anywhere</div>
    <chime *forAnyOrder="let chime of chimes | async"
           [chime]=chime>
    </chime>
    <thank-you *ngIf="isDone()">
    </thank-you>
  `,
  styles: [require('./windchimes.component.css').toString()]
})
export class WindchimesInteractive {
  clicks = new Subject<{
    x: number, y: number,
    screenHeight: number
  }>();
  noteSampler = this.spacial.sampler(this.notes, true);
  chimes = this.clicks.map(({x, y, screenHeight}) => ({
    x,
    y,
    note: this.noteSampler(y, screenHeight),
    state: 'chiming',
    muted: this.muted
  }))
    .bufferTime(5000, 10);

  clicked = false;
  state: string;
  muted: boolean;

  constructor(private random: Random,
    private audio: Audio,
    private spacial: Spacial,
    private samples: Samples,
    @Inject('notes') private notes,
    @Inject('audioContext') private audioCtx) {
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.clicked) {
      // unlock audio on ios
      const src = this.audioCtx.createBufferSource();
      src.buffer = this.audioCtx.createBuffer(1, 1, 22050);
      src.connect(this.audioCtx.destination);
      src.start(0);
    }
    this.clicked = true;
    if (!this.isDone()) {
      this.clicks.next({
        x: event.clientX, y: event.screenY, screenHeight: window.screen.availHeight
      });
    }
  }

  isDone() {
    return this.state === 'done';
  }
}
