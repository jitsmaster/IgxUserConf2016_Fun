import {Injectable, Inject, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class Audio {

  compressor: DynamicsCompressorNode;

  private _onPlaybackRequestAnimFrame: BehaviorSubject<{
    percent: number,
    freqs: Uint8Array,
    times: Uint8Array
  }> = new BehaviorSubject<{
    percent: number,
    freqs: Uint8Array,
    times: Uint8Array
  }>(null);
  public onPlaybackRequestAnimFrame: Observable<{
    percent: number,
    freqs: Uint8Array,
    times: Uint8Array
  }> = this._onPlaybackRequestAnimFrame.asObservable();

  public onPlayEnd: EventEmitter<any> = new EventEmitter<any>();

  constructor( @Inject('audioContext') public audioCtx) {
    this.compressor = this.createCompressor();
  }

  createCompressor(threshold: number = -20) {
    var compressor = this.audioCtx.createDynamicsCompressor();
    compressor.threshold.value = threshold;
    compressor.knee.value = 10;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;
    // Try for lulz:
    // this.compressor.release.value = 0;
    compressor.connect(this.audioCtx.destination);

    return compressor;
  }

  play(sample, panVal = 0) {
    const source = this.audioCtx.createBufferSource();

    source.buffer = sample;

    const pan = this.audioCtx.createStereoPanner();
    pan.pan.value = panVal;

    source.connect(pan);
    pan.connect(this.compressor);

    source.onended = () => {
      this.onPlayEnd.emit(source);
    }

    source.start(0);

    return () => {
      source.stop(0);
      source.disconnect();
      pan.disconnect();
    }
  }

  freqs: Uint8Array;
  times: Uint8Array;

  _source;
  _analyzer;

  startTime = 0;
  startOffset = 0;

  playWithData(sample) {
    if (this._paused) {
      this._paused = false;
      this.audioCtx.resume();
    }
    else {
      const source = this.audioCtx.createBufferSource();
      source.buffer = sample;
      // source.playbackRate.value = 0.5;
      // source.loop = true;
      source.onended = () => {
        this.onPlayEnd.emit(source);
      }
      var analyzer = this.audioCtx.createAnalyser();
      analyzer.minDecibels = -140;
      analyzer.maxDecibels = 0;
      this.freqs = new Uint8Array(analyzer.frequencyBinCount);
      this.times = new Uint8Array(analyzer.frequencyBinCount);

      source.connect(analyzer);
      analyzer.connect(this.compressor);

      this.startTime = this.audioCtx.currentTime;

      source[source.start ? 'start' : 'noteOn'](0, this.startOffset % sample.duration);

      this._paused = false;
      requestAnimationFrame(() => this._requestAnimFrame(source, analyzer));

      this._source = source;
      this._analyzer = analyzer;
    }

    return () => {
      if (this._source) {
        this._source.stop(0);
        this._source.disconnect();
      }
      if (this._analyzer)
        this._analyzer.disconnect();
      this.audioCtx.resume();
      this._paused = false;
    }
  }

  _paused: boolean = false;

  pause() {
    this._paused = true;
    this.audioCtx.suspend();
    //this._source[this._source.stop ? 'stop' : 'noteOff'](0)

    this.startOffset += this.audioCtx.currentTime - this.startTime;
  }

  _requestAnimFrame(source, analyzer) {
    analyzer.smoothingTimeConstant = 0.8;
    analyzer.fftSize = 2048;

    // Get the frequency data from the currently playing music
    analyzer.getByteFrequencyData(this.freqs);
    analyzer.getByteTimeDomainData(this.times);

    this._onPlaybackRequestAnimFrame.next({
      percent: Math.min(100, 100 * (this.audioCtx.currentTime - this.startTime) / source.buffer.duration),
      freqs: this.freqs,
      times: this.times
    });

    // if (!this._paused)
    requestAnimationFrame(() => this._requestAnimFrame(source,
      analyzer));
  }

  // Noise node code from http://noisehack.com/generate-noise-web-audio-api/

  pinkNoiseNode() {
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    var node = this.audioCtx.createScriptProcessor(4096, 1, 1);
    node.onaudioprocess = function (e) {
      var output = e.outputBuffer.getChannelData(0);
      for (var i = 0; i < 4096; i++) {
        var white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // (roughly) compensate for gain
        b6 = white * 0.115926;
      }
    };
    return node;
  }

  brownNoiseNode() {
    var lastOut = 0.0;
    var node = this.audioCtx.createScriptProcessor(4096, 1, 1);
    node.onaudioprocess = function (e) {
      var output = e.outputBuffer.getChannelData(0);
      for (var i = 0; i < 4096; i++) {
        var white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.12;
        lastOut = output[i];
        output[i] *= 3.5; // (roughly) compensate for gain
      }
    }
    return node;
  }

  gainFor(node) {
    var gain = this.audioCtx.createGain();
    node.connect(gain);
    return gain;
  }

  startNode(node) {
    node.connect(this.audioCtx.destination);
  }

  stopNode(node) {
    node.disconnect();
  }

}
