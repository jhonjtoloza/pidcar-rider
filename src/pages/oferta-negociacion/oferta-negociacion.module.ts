import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {OfertaNegociacionPage} from './oferta-negociacion';
import {PipesModule} from "../../pipes/pipes.module";
import {CommonModule} from "@angular/common";
import {IonicModule} from "ionic-angular/module";

@NgModule({
  declarations: [
    OfertaNegociacionPage,
  ],
  imports: [
    IonicPageModule.forChild(OfertaNegociacionPage),
    PipesModule,
    CommonModule,
    IonicModule,
  ],
})
export class OfertaNegociacionPageModule {
}
