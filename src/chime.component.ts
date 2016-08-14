import {Component, Inject, Input, OnInit, OnDestroy, trigger, transition, animate, style, group} from '@angular/core';
import {Samples} from './services/samples.service';
import {Audio} from './services/audio.service';

@Component({
  selector: 'chime',
  template: `
    <div class="ring {{chime.note}}" @expand="any"
         [style.left.px]="chime.x - 150"
         [style.top.px]="chime.y - 250">
    </div>
    <div class="ring {{chime.note}}" @expand2="any"
         [style.left.px]="chime.x - 150"
         [style.top.px]="chime.y - 250">
    </div>
    <div class="ring {{chime.note}}" @expand3="any"
         [style.left.px]="chime.x - 150"
         [style.top.px]="chime.y - 250">
    </div>
    <div class="light" @flash="any"
         [style.left.px]="chime.x - 150"
         [style.top.px]="chime.y - 250">
    </div>
  `,
  styles: [require('./chime.component.css').toString()],
  animations: [
    trigger('expand', [
      transition('void => *', [
        style({ opacity: 1, 
          transform: 'scale3d(.1,.1,.1) translateZ(0)' }),
        group([
          animate('3s',
            style({ opacity: 0 })),
          animate('3s',
            style({ borderWidth: "40px" })),
          animate('5s linear',
            style({ transform: 'scale3d(1,1,1) translateZ(0)' }))
        ])
      ])
    ]),
    trigger('expand2', [
      transition('void => *', [
        style({ opacity: 0.6, 
          transform: 'scale3d(.1,.1,.1) translateZ(0)' }),
        group([
          animate('3s 0.8s',
            style({ opacity: 0 })),
          animate('3s 0.8s',
            style({ borderWidth: "40px" })),
          animate('5s 0.8s linear',
            style({ transform: 'scale3d(1,1,1) translateZ(0)' }))
        ])
      ])
    ]),
    trigger('expand3', [
      transition('void => *', [
        style({ opacity: 0.3, 
          transform: 'scale3d(.1,.1,.1) translateZ(0)' }),
        group([
          animate('3s 1.6s',
            style({ opacity: 0 })),
          animate('3s 1.6s',
            style({ borderWidth: "40px" })),
          animate('5s 1.6s linear',
            style({ transform: 'scale3d(1,1,1) translateZ(0)' }))
        ])
      ])
    ]),
    trigger('flash', [
      transition('void => *', [
        style({ opacity: 0, transform: 'scale3d(.2,.2,.2) translateZ(0)' }),
        animate('0.05s ease-in',
          style({ opacity: 1, transform: 'scale3d(1,1,1) translateZ(0)' })
        ),
        animate('1s ease-out',
          style({ opacity: 0, transform: 'scale3d(0,0,0) translateZ(0)' })
        )
      ])
    ])
  ]
})
export class Chime implements OnInit, OnDestroy {
  @Input() chime: { x: number, y: number, note: string };
  stopAudio: () => void;

  constructor(private samples: Samples,
    private audio: Audio,
    @Inject('size') private size) {
  }

  ngOnInit() {
    this.samples.getSample(this.chime.note).then(sample => {
      this.stopAudio = this.audio.play(sample, (this.chime.x / this.size.width) * 3 - 1);
    });
  }

  ngOnDestroy() {
    if (this.stopAudio) {
      this.stopAudio();
    }
  }
}
