import {Component, Inject, HostListener} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ForAnyOrder} from './directives/forAnyOrder.directive';
import {Chime} from './chime.component';
import {Random} from './services/random.service';
import {Spacial} from './services/spacial.service';
import {Audio} from './services/audio.service';
import {Samples} from './services/samples.service';

@Component({
  selector: 'wind-chimes',
  template: `
    <chime *forAnyOrder="let chime of chimes | async"
           [chime]=chime>
    </chime>
  `,
  styles: [require('./windchimes.component.css').toString()]
})
export class Windchimes {
  chimes: Observable<{ x: number, y: number, note: string }[]>;
  size;

  noteSampler;
  spaceSampler = this.spacial.sampler([1, 2, 3, 4, 5], true);
  pos: number = 200;

  constructor(private random: Random,
    private spacial: Spacial,
    private audio: Audio,
    private samples: Samples,
    @Inject('notes') notes,
    @Inject('size') size) {
    this.size = size;
    this.noteSampler = random.sampler(notes);
    this.chimes = random.dynaNoise(2000, () => {
      return this.pos;
    }, 5)
      .map(() => ({
        x: random.nextInt(0, size.width),
        y: random.nextInt(0, size.height),
        note: this.noteSampler()
      }))
      .bufferTime(5000, 10);
  }

  @HostListener('click', ['$event'])

  onClick(event: MouseEvent) {
    var i = this.spaceSampler(event.screenY, window.screen.availHeight);
    this.pos = 210 / i;
    this.gain.gain.value = Math.pow(10, ((i-1)/10))
    console.log(this.pos);
  }
  source;
  gain;
  // windNoise;
  // windVolume;
  stopAudio: () => void;
  ngOnInit() {
    setTimeout(() => {
      this.samples.getSample("WIND").then(sample => {
        this.source = this.audio.audioCtx.createBufferSource();
        this.source.buffer = sample;
        this.source.loop = true;
        this.gain = this.audio.gainFor(this.source);
        this.gain.gain.value = 0.2;
        this.gain.connect(this.audio.createCompressor(0));

        this.source.start(0);
      });

      // this.windNoise = this.audio.brownNoiseNode();
      // this.windVolume = this.audio.this.gainFor(this.windNoise);
      // this.windVolume.this.gain.value = this.pos / 1000;
      // this.audio.startNode(this.windVolume);
    }, 2000);
  }

  ngOnDestroy() {
    // this.audio.stopNode(this.windVolume);
    // this.audio.stopNode(this.windNoise);
    this.audio.stopNode(this.source);
    this.audio.stopNode(this.gain);
  }
}
