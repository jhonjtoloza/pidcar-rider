import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {OfertaNegociacionPage} from './oferta-negociacion';
import {PipesModule} from "../../pipes/pipes.module";

@NgModule({
  declarations: [
    OfertaNegociacionPage,
  ],
  imports: [
    IonicPageModule.forChild(OfertaNegociacionPage),
    PipesModule,
  ],
})
export class OfertaNegociacionPageModule {
}
