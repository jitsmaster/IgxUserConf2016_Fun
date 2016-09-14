import {Component, Inject, Injector, Input, OnInit, OnChanges, OnDestroy, ViewChild, ChangeDetectionStrategy,
	ElementRef,
	trigger, transition, animate, style, group} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import {Samples} from './services/samples.service';
import {Audio} from './services/audio.service';
import {Observable, BehaviorSubject} from 'rxjs/Rx';

const PADDLE_MOVE_SPEED: number = 5;

@Component({
	selector: 'pong-game',
	template: `
		<div #paddle class="paddle" [style.top]="paddlePosition | async"></div>
	`,
	styles: [require('./pong.component.css').toString()],
	host: {
		'(document:keydown)': 'movePaddle($event)',
		'(document:keyup)': 'paddleStop($event)'
	}
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class Pong implements OnDestroy{

	@ViewChild("paddle") paddle: ElementRef;

	private _pos = 0;

	private _paddleSubject: BehaviorSubject<string> = new BehaviorSubject<string>(this._pos + "px");
	paddlePosition: Observable<string> = this._paddleSubject.asObservable();

	_timer;

	_speedMultiplier: number = 1;

	get speed() {
		return PADDLE_MOVE_SPEED * this._speedMultiplier;
	}

	_paddleHeight: number;

	ngOnDestroy() {

		this.paddle.nativeElement.parentMode.removeChild(this.paddle.nativeElement);
	}

	constructor(private injector: Injector) {		
	}

	movePaddle(evt: KeyboardEvent) {
		var body = this.injector.get(DOCUMENT).body as HTMLElement;
		body.appendChild(this.paddle.nativeElement);

		this._paddleHeight = this.paddle.nativeElement.offsetHeight;

		this.paddleStop(null);

		this._movePaddle(evt.keyCode);

		this._timer = setInterval(() => {
			this._movePaddle(evt.keyCode);
		}, 16)

		if (evt) {
			evt.stopPropagation();
			evt.preventDefault();
		}
	}

	_movePaddle(keyCode: number) {
		if (keyCode == 38) {
			//up
			this._pos -= this.speed;
			this._pos = Math.max(0, this._pos);
			this._paddleSubject.next(this._pos + "px");
		}
		else if (keyCode == 40) {
			//down
			this._pos += this.speed;
			this._pos = Math.min(window.screen.availHeight - this._paddleHeight , this._pos);
			this._paddleSubject.next(this._pos + "px");
		}
	}

	paddleStop(evt: KeyboardEvent) {
		if (this._timer) {
			clearInterval(this._timer);
			delete this._timer;
		}
	}
}