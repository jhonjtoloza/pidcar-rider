import {Pipe, PipeTransform} from '@angular/core';

/**
 * Generated class for the DistancePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'distance',
})
export class DistancePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: any, ...args) {
    console.log(value);
    if (value > 1) {
      return value.toFixed(1) + "Km"
    } else {
      return (value * 1).toFixed(0) + 'Metros'
    }
  }
}
