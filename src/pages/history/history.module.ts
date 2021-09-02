import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {HistoryPage} from './history';
import {IonicModule} from "ionic-angular/module";

@NgModule({
  declarations: [
    HistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(HistoryPage),
    IonicModule,
  ],
})
export class HistoryPageModule {
}
