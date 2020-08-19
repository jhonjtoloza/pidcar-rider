import {NgModule} from '@angular/core';
import {SafeurlPipe} from './safeurl/safeurl';
import {DistancePipe} from './distance/distance';

@NgModule({
  declarations: [SafeurlPipe,
    DistancePipe],
  imports: [],
  exports: [SafeurlPipe,
    DistancePipe]
})
export class PipesModule {
  static forRoot() {
    return {
      ngModule: PipesModule,
      providers: [],
    };
  }
}
