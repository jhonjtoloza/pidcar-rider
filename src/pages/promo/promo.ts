import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {BonusPage} from "../bonus/bonus";

/**
 * Generated class for the PromoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-promo',
  templateUrl: 'promo.html',
})
export class PromoPage {

  hidden = false;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController) {
  }

  close() {
    this.viewCtrl.dismiss();
  }

  goBonuPage() {
    this.navCtrl.push(BonusPage);
  }

  setHidden() {
    this.hidden = !this.hidden;
    if (this.hidden){
      localStorage.setItem('hidden-promo', String(this.hidden));
    } else {
      localStorage.removeItem('hidden-promo');
    }
  }
}
