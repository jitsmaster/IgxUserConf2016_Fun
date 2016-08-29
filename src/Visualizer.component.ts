import {Component, Inject, HostListener, Query, QueryList, ElementRef,
	ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Audio} from './services/audio.service';
import {Samples} from './services/samples.service';

@Component({
	selector: 'visualizer',
	template: `
	<select (change)="select($event)" #trackSelect
	[value]="_name" >
		<option>[Select a song to play]</option>
		<option *ngFor="let name of sampleNames">{{name}}</option>
	</select>
	<button (click)="control()"  [style.display]="!!trackSelect.value ? '' : 'none'">{{buttonText}}</button>
	<div class="progressBar" #progressBar>
		<div class="progressFill" [style.width]="progress" ></div>
		<div class="seekButton" [style.left]="progress" #seekButton
			(mousedown)="startSeeking($event)"></div>
	</div>
    <canvas #can style="position:absolute;bottom:100"></canvas>
  `,
	styles: [require('./visualizer.css').toString()],
	providers: [
		Audio, Samples
	],
	host: {
		// 'document:mousedown': 'startSeeking($event)',
		'document:mousemove': 'checkSeek($event)',
		'document:mouseup': 'endSeeking($event)'
	}
})
export class Visualizer {
	playHandler: Function;

	@ViewChild('progressBar') progressBar: ElementRef;
	@ViewChild('seekButton') seekButton: ElementRef;

	playing = false;

	sampleNames = ["AMERICA", "SPRING", "SOMEWHERE"];

	constructor(private audio: Audio,
		private samples: Samples,
		private ele: ElementRef) {
	}

	_name: string;

	currentSample;

	progress: string = "0px";

	get buttonText(): string {
		return this.playing ? "Pause" : "Resume";
	}

	_seekStarted = false;

	_progressWidth: number;
	_progressLeft: number;

	startSeeking(evt: MouseEvent) {
		if (evt.target != this.seekButton.nativeElement)
			return;

		this._seekStarted = true;
		this._progressWidth = this.progressBar.nativeElement.offsetWidth;
		this._progressLeft = (this.progressBar.nativeElement as HTMLElement).clientLeft;
		evt.stopPropagation();
		evt.preventDefault();
	}

	private _progressPercent: number;

	checkSeek(evt: MouseEvent) {
		if (!this._seekStarted)
			return;
		var progressPx = evt.screenX - this._progressLeft;
		this._progressPercent = (100 * progressPx / this._progressWidth);
		this.progress = this._progressPercent + "%";
	}

	endSeeking(evt: MouseEvent) {
		if (!this._seekStarted)
			return;

		this._seekStarted = false;
		this.checkSeek(evt);
		this.playWithOffset();
	}

	select(evt: Event) {
		// this._name = evt.currentTarget["value"];
		this.playSample(evt.currentTarget["value"]);
	}

	playSample(sampleName: string) {
		this._name = sampleName;

		if (!!this.playHandler)
			this.playHandler();

		this.playing = false;

		this.audio.startTime = 0;
		this.audio.startOffset = 0;
		this.progress = "0px";

		this.currentSample = null;

		this._play(false);
	}

	playWithOffset() {
		this.audio.startOffset = this._progressPercent * this.audio.currentSampleDuration / 100;
		this._play(true);
	}

	playNext() {
		var index = this.sampleNames.findIndex(s => s == this._name);
		if (index == -1)
			index = 0;
		else {
			if (index < this.sampleNames.length - 1) {
				index++;
			}
			else
				index = 0;
		}

		this.playSample(this.sampleNames[index]);
	}

	_play(seekPlay: boolean) {
		if (!this._name)
			return;

		if (!this.currentSample) {
			this.samples.getSample(this._name).then(sample => {
				this.currentSample = sample;
				this.playHandler = this.audio.playWithData(sample, seekPlay);
				this.playing = true;
			});
		}
		else {
			this.playHandler = this.audio.playWithData(this.currentSample, seekPlay);
			this.playing = true;
		}
	}

	ngOnInit() {
		this.audio.onPlaybackRequestAnimFrame.subscribe(freqs => {
			this.drawFrame(freqs);
		});
		this.audio.onPlayEnd.subscribe(source => {
			if (this.playing)
				this.playNext();
		});

		this.ele.nativeElement.style.textAlign = "center";
	}
	ngOnDestroy() {
		if (this.playHandler)
			this.playHandler();
	}

	control() {
		if (this.playing) {
			this.audio.pause();
			this.playing = !this.playing;
		}
		else {
			this._play(false);
		}
	}
	lastPos: { x: number, y: number };

	drawFrame(stats: {
		percent: number,
		freqs: Uint8Array,
		times: Uint8Array
	}) {
		if (this._seekStarted)
			return;

		if (!stats)
			return;

		this.progress = stats.percent + "%";
		var canvas = (this.ele.nativeElement as HTMLElement).querySelector('canvas') as HTMLCanvasElement;
		var w = Math.floor(window.screen.availWidth);
		canvas.width = w;
		canvas.height = 480;
		var drawContext = canvas.getContext('2d');

		var h = 480;

		var l = stats.freqs.length * 0.7

		// Draw the frequency domain chart.
		for (var i = 0; i < l; i++) {
			var value = stats.freqs[i];
			var percent = value / 256;
			var height = h * percent;
			var offset = h - height - 1;
			var barWidth = w / l;
			var hue = i / l * 360;
			drawContext.fillStyle = 'hsl(' + hue + ', 90%, 70%)';
			drawContext.fillRect(i * barWidth, offset, barWidth, height);
		}

		drawContext.beginPath();
		drawContext.lineWidth = 2;

		for (var i = 0; i < l; i++) {
			var value = stats.times[i];
			var percent = value / 256;
			var height = h * percent * 1.2;
			var offset = h - height - 1;
			var barWidth = w / l;

			if (i == 0)
				drawContext.moveTo(0, offset)
			else {

				// drawContext.bezierCurveTo(this.lastPos.x, (offset + this.lastPos.y) / 2,
				// 	(i * barWidth + this.lastPos.x) / 2, offset, i * barWidth, offset);
				drawContext.lineTo(i * barWidth, offset);

			}

			this.lastPos = {
				x: i * barWidth,
				y: offset
			}
		}

		drawContext.strokeStyle = "#ffffff";
		drawContext.stroke();
	}
}