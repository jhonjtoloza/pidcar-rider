import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

/**
 * Generated class for the SafeurlPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'safeurl',
})
export class SafeurlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
