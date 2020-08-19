import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Market} from "@ionic-native/market";

/**
 * Generated class for the PuntosgoldPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-puntosgold',
  templateUrl: 'puntosgold.html',
})
export class PuntosgoldPage {

  constructor(public nav: NavController, public navParams: NavParams, public market: Market) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PuntosgoldPage');
  }

  openApp() {
    this.market.open('com.puntosdorados.cliente');
  }

}
