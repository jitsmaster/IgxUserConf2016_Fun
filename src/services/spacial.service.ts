import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class Spacial {

  constructor() { }

  sampler<T>(array: T[], reverse: boolean) {
    if (reverse)
      array = array.reverse();
      
    return (y: number, screenHeight: number) => {
      //divide by 5 for screen height
      var hUnit = screenHeight / 5;
      var i = 4;
      while(i > -1) {
        var height = hUnit * i;
        if (y > height)
          return array[i];
        i--;
      }

      return array[0];
    }
  }
}
