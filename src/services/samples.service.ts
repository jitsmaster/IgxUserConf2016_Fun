import {Injectable, Inject, NgZone} from '@angular/core';
const loader = require('webaudio-buffer-loader');

const NOTE_SAMPLES = {
  C4: require("file!../samples/n_C4.mp3"),
  G4: require("file!../samples/n_G4.mp3"),
  C5: require("file!../samples/n_C5.mp3"),
  D5: require("file!../samples/n_D5.mp3"),
  E5: require("file!../samples/n_E5.mp3"),
  PIANO_C4: require("file!../samples/piano_C4.mp3"),
  PIANO_G4: require("file!../samples/piano_G4.mp3"),
  PIANO_C5: require("file!../samples/piano_C5.mp3"),
  PIANO_D5: require("file!../samples/piano_D5.mp3"),
  PIANO_E5: require("file!../samples/piano_E5.mp3"),
  WIND: require("file!../samples/windhowl.mp3"),
  AMERICA: require("file!../samples/america.mp3"),
  SPRING: require("file!../samples/spring.mp3"),
  SOMEWHERE: require("file!../samples/somwhere.mp3")
};

@Injectable()
export class Samples {
  totalSampleCount = 0;
  loadedSampleCount = 0;
  private sampleCache = new Map();

  constructor( @Inject('audioContext') private audioCtx, private ngZone: NgZone) {
    for (const note of Object.keys(NOTE_SAMPLES)) {
      this.getSample(note);
    }
  }

  getSample(note: string) {
    if (!this.sampleCache.has(note)) {
      this.totalSampleCount++;
      this.sampleCache.set(note, new Promise((resolve, reject) => {
        loader(NOTE_SAMPLES[note], this.audioCtx, (err, loadedBuffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(loadedBuffer);
            this.ngZone.run(() => this.loadedSampleCount++);
          }
        });
      }));
    }
    return this.sampleCache.get(note);
  }

}
