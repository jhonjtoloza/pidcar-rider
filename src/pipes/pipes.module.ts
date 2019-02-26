import { NgModule } from '@angular/core';
import { SafeurlPipe } from './safeurl/safeurl';
@NgModule({
	declarations: [SafeurlPipe],
	imports: [],
	exports: [SafeurlPipe]
})
export class PipesModule {
  static forRoot() {
    return {
      ngModule: PipesModule,
      providers: [],
    };
  }
}
