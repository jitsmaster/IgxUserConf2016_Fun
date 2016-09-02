import {Component, Input} from '@angular/core';

@Component({
  selector: 'loading-indicator',
  template: `
    <div [style.width]="progressPx" [style.top]="top" class="progress"></div>
  `,
  styles: [require('./loading-indicator.component.css').toString()]
})
export class LoadingIndicator {
  @Input() progress = 0;

  top: string;

  ngOnInit() {
    this.top = window.screen.height * 0.8 + "px";
  }

  get progressPx(): string {
    var w = window.screen.availWidth;
    return (w * this.progress / 100) + "px"
  }
}
