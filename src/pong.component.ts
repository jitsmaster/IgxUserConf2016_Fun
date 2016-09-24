import {Component, Inject, Injector, Input, OnInit, OnChanges, OnDestroy, ViewChild, ChangeDetectionStrategy,
	ElementRef,
	trigger, transition, animate, style, state, group} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import {Samples} from './services/samples.service';
import {Audio} from './services/audio.service';
import {Observable, BehaviorSubject} from 'rxjs/Rx';

const PADDLE_MOVE_SPEED: number = 5;
const BALL_SPEED: number = 4;
const ANGLE = 45; //@45 degrees
const BOTTOM_OFFSET = 100;
const SCORE_UNIT = 100;

class Pos {
	x: number = 0;
	y: number = 0;
}

@Component({
	selector: 'pong-game',
	template: `
	<label>
      <input type='checkbox' (change)='toggleSettings()'/>  
      Settings
    </label>
    <div [@configSlide]="showAdvanced ? 'open' : 'closed'">
      <span class='config'>
        Difficulty:
        <select [(ngModel)]='difficulty'>
          <option value="1">Just close my eyes</option>
          <option value="2">Spend most time waitinng</option>
          <option value="3" selected >My old fond childhood memory</option>
          <option value="4">Rocky catching a chicken</option>
          <option value="5">Chased by a thousand bees</option>
		  <option value="6">Dark Souls, Bloodborne, Nioh...</option>
        </select>
      </span>
    </div>
	<div class="scoreCard">
		Score: <span [innerHTML]="score | async"></span>
	</div>
	<div #paddle class="paddle" [style.top]="paddlePosition | async"></div>
	<div #ball class="ball" [style.left.px]="(ballPosition | async).x"
		[style.top.px]="(ballPosition | async).y"></div>
	`,
	styles: [require('./pong.component.css').toString()],
	host: {
		'(document:keydown)': 'movePaddle($event)',
		'(document:keyup)': 'paddleStop($event)'
	},
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
export class Pong implements OnDestroy, OnInit {

	@ViewChild("paddle") paddle: ElementRef;

	private _paddlePos = 0;
	private _score = 0;
	private _ballPos: Pos = {
		x: 0,
		y: 0,
	}

	private _paddleSubject: BehaviorSubject<string> = new BehaviorSubject<string>(this._paddlePos + "px");
	paddlePosition: Observable<string> = this._paddleSubject.asObservable();

	private _ballPosSubject: BehaviorSubject<Pos> = new BehaviorSubject<Pos>(this._ballPos);
	ballPosition: Observable<Pos> = this._ballPosSubject.asObservable();

	private _scoreSubject: BehaviorSubject<string> = new BehaviorSubject<string>("0");
	score: Observable<string> = this._scoreSubject.asObservable();

	private _paddleMoveTimer;
	private _ballMoveTimer;
	private _scoreTimer;

	private _paddleSpeedMultiplier: number = 3;
	private _ballSpeedMultiplier: number = 3;
	private _tanMultiplier: number = 1;
	private _scoreMultiplier: number = 3;

	get paddleSpeed() {
		return PADDLE_MOVE_SPEED * this._paddleSpeedMultiplier;
	}

	get ballSpeed() {
		return BALL_SPEED * this._ballSpeedMultiplier;
	}

	get angle() {
		return ANGLE * this._tanMultiplier;
	}

	_difficulty: string = '3';

	get difficulty(): string {
		return this._difficulty;
	}

	set difficulty(val: string) {
		this._difficulty = val;
		switch (val) {
			case '1':
				this._paddleSpeedMultiplier = 2;
				this._ballSpeedMultiplier = 1;
				this._tanMultiplier = 1;
				this._scoreMultiplier = 0.2;
				break;
			case '2':
				this._paddleSpeedMultiplier = 2;
				this._ballSpeedMultiplier = 2;
				this._tanMultiplier = 1;
				this._scoreMultiplier = 0.5;
				break;
			case '4':
				this._paddleSpeedMultiplier = 4;
				this._ballSpeedMultiplier = 4;
				this._tanMultiplier = 1;
				this._scoreMultiplier = 2;
				break;
			case '5':
				this._paddleSpeedMultiplier = 5;
				this._ballSpeedMultiplier = 8;
				this._tanMultiplier = 1;
				this._scoreMultiplier = 5;
				break;
			case '6':
				this._paddleSpeedMultiplier = 6;
				this._ballSpeedMultiplier = 8;
				this._tanMultiplier = Math.max(0.1, Math.random());
				this._scoreMultiplier = 10;
				break;
			default:
				this._paddleSpeedMultiplier = 3;
				this._ballSpeedMultiplier = 3;
				this._tanMultiplier = 1;
				this._scoreMultiplier = 1;
		}
	}

	showAdvanced: boolean;

	toggleSettings() {
		this.showAdvanced = !this.showAdvanced;
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
		this.stopAudio();
	}

	private _tempScore = 0;

	stopAudio: Function;

	ngOnInit() {

		//start moving ball
		//we will have a interval to calculate the next position, base on tan and speed
		this._ballMoveTimer = setInterval(() => {

			var posDiff = this.getPosDiff();
			this._ballPos.x += posDiff.x;
			this._ballPos.y += posDiff.y;

			var hitThePaddle = this._ballPos.x <= 220 + this.ballSpeed
				&& this._ballPos.x > 200
				&& this._ballPos.y >= this._paddlePos
				&& this._ballPos.y <= this._paddlePos + this.paddle.nativeElement.clientHeight
				&& posDiff.x < 0;

			if (hitThePaddle
				|| this._ballPos.x <= 0
				|| this._ballPos.x >= window.screen.availWidth - BOTTOM_OFFSET - 40) {
				this._xRevert = !this._xRevert;
				if (hitThePaddle) {
					//increaseScore 
					this._score += this._scoreMultiplier * SCORE_UNIT;

					this.samples.getSample("PINGPONG").then(sample => {
						this.stopAudio = this.audio.play(sample, 0);
					});

					if (this._scoreTimer)
						clearInterval(this._scoreTimer);

					this._scoreTimer = setInterval(() => {
						this._tempScore++;
						this._scoreSubject.next(this._tempScore.toString());

						if (this._tempScore >= this._score) {
							clearInterval(this._scoreTimer);
							delete this._scoreTimer
						}
					}, 16)
				}
			}

			if (this._ballPos.y <= 0 || this._ballPos.y >= window.screen.availHeight - BOTTOM_OFFSET - 40)
				this._yRevert = !this._yRevert;

			this._ballPosSubject.next(this._ballPos);

		}, 16);
	}

	constructor(private injector: Injector,
		private audio: Audio,
		private samples: Samples) {

	}

	movePaddle(evt: KeyboardEvent) {

		//add 100 offset for bottom
		this._paddleHeight = this.paddle.nativeElement.clientHeight;

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
			this._paddlePos -= this.paddleSpeed;
			this._paddlePos = Math.max(0, this._paddlePos);
			this._paddleSubject.next(this._paddlePos + "px");
		}
		else if (keyCode == 40) {
			//down
			this._paddlePos += this.paddleSpeed;
			this._paddlePos = Math.min(window.screen.availHeight - this._paddleHeight - BOTTOM_OFFSET,
				this._paddlePos);
			this._paddleSubject.next(this._paddlePos + "px");
		}
	}

	paddleStop(evt: KeyboardEvent) {
		if (this._paddleMoveTimer) {
			clearInterval(this._paddleMoveTimer);
			delete this._paddleMoveTimer;
		}
	}
}