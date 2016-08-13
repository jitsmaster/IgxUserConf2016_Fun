import {Component, Input} from '@angular/core';

@Component({
  selector: 'loading-indicator',
  template: `
    <div [style.width]="width" [style.height]="height" class="progressPx"></div>
  `,
  styles: [require('./loading-indicator.component.css').toString()]
})
export class LoadingIndicator {
  @Input() progress = 0;

  width: string;
  height: string;

  ngOnInit() {
    this.width = window.screen.width + "px";
    this.height = window.screen.height * 0.9 + "px";
  }

  get progressPx(): string {
    var w = window.screen.width;
    return (w * this.progress / 100) + "px"
  }
}
