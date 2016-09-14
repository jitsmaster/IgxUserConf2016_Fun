import {Component, Inject, Injector, Input, OnInit, OnChanges, OnDestroy, ViewChild, ChangeDetectionStrategy,
	ElementRef,
	trigger, transition, animate, style, group} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import {Samples} from './services/samples.service';
import {Audio} from './services/audio.service';
import {Observable, BehaviorSubject} from 'rxjs/Rx';

const PADDLE_MOVE_SPEED: number = 5;
const BALL_SPEED: number = 5;
const ANGLE = 45; //@45 degrees
const BOTTOM_OFFSET = 100;

class Pos {
	x: number = 0;
	y: number = 0;
}

@Component({
	selector: 'pong-game',
	template: `
		<div #paddle class="paddle" [style.top]="paddlePosition | async"></div>
		<div #ball class="ball" [style.left.px]="(ballPosition | async).x"
			[style.top.px]="(ballPosition | async).y"></div>
	`,
	styles: [require('./pong.component.css').toString()],
	host: {
		'(document:keydown)': 'movePaddle($event)',
		'(document:keyup)': 'paddleStop($event)'
	}
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class Pong implements OnDestroy, OnInit {

	@ViewChild("paddle") paddle: ElementRef;

	private _pos = 0;

	private _ballPos: Pos = {
		x: 0,
		y: 0,
	}

	private _paddleSubject: BehaviorSubject<string> = new BehaviorSubject<string>(this._pos + "px");
	paddlePosition: Observable<string> = this._paddleSubject.asObservable();

	private _ballPosSubject: BehaviorSubject<Pos> = new BehaviorSubject<Pos>(this._ballPos);
	ballPosition: Observable<Pos> = this._ballPosSubject.asObservable();

	private _paddleMoveTimer;
	private _ballMoveTimer;

	private _paddleSpeedMultiplier: number = 1;
	private _ballSpeedMultiplier: number = 1;
	private _tanMultiplier: number = 1;

	get paddleSpeed() {
		return PADDLE_MOVE_SPEED * this._paddleSpeedMultiplier;
	}

	get ballSpeed() {
		return BALL_SPEED * this._ballSpeedMultiplier;
	}

	get angle() {
		return ANGLE * this._tanMultiplier;
	}

	private _xRevert: boolean;
	private _yRevert: boolean;

	getPosDiff(): Pos {
		return {
			x: this.ballSpeed * Math.cos(this.angle) * (this._xRevert ? -1 : 1),
			y: this.ballSpeed * Math.sin(this.angle) * (this._yRevert ? -1 : 1)
		};
	}

	_paddleHeight: number;

	ngOnDestroy() {

		this.paddle.nativeElement.parentMode.removeChild(this.paddle.nativeElement);
	}

	ngOnInit() {
		//start moving ball
		//we will have a interval to calculate the next position, base on tan and speed
		this._ballMoveTimer = setInterval(() => {

			var posDiff = this.getPosDiff();
			this._ballPos.x += posDiff.x;
			this._ballPos.y += posDiff.y;

			if (this._ballPos.x <= 0 || this._ballPos.x >= window.screen.availWidth - BOTTOM_OFFSET - 40)
				this._xRevert = !this._xRevert;

			if (this._ballPos.y <= 0 || this._ballPos.y >= window.screen.availHeight - BOTTOM_OFFSET - 40)
				this._yRevert = !this._yRevert;

			this._ballPosSubject.next(this._ballPos);

		}, 16);
	}

	constructor(private injector: Injector) {
	}

	movePaddle(evt: KeyboardEvent) {
		var body = this.injector.get(DOCUMENT).body as HTMLElement;
		body.appendChild(this.paddle.nativeElement);

		//add 100 offset for bottom
		this._paddleHeight = this.paddle.nativeElement.offsetHeight - BOTTOM_OFFSET;

		this.paddleStop(null);

		this._movePaddle(evt.keyCode);

		this._paddleMoveTimer = setInterval(() => {
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
			this._pos -= this.paddleSpeed;
			this._pos = Math.max(0, this._pos);
			this._paddleSubject.next(this._pos + "px");
		}
		else if (keyCode == 40) {
			//down
			this._pos += this.paddleSpeed;
			this._pos = Math.min(window.screen.availHeight - this._paddleHeight, this._pos);
			this._paddleSubject.next(this._pos + "px");
		}
	}

	paddleStop(evt: KeyboardEvent) {
		if (this._paddleMoveTimer) {
			clearInterval(this._paddleMoveTimer);
			delete this._paddleMoveTimer;
		}
	}
}