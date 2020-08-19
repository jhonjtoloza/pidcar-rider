import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {ApiService} from "../../services/api.service";

/**
 * Generated class for the BonusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bonus',
  templateUrl: 'bonus.html',
})
export class BonusPage {
  index: {
    code: string,
    numeroAfiliados: string,
    puntos: string,
    afiliados: string,
    referidos: string,
    isFacebookPass: boolean,
    terminos: any
  } = {
    code: '0',
    numeroAfiliados: '0',
    puntos: '0',
    afiliados: '0',
    referidos: '0',
    isFacebookPass: false,
    terminos: {}
  };

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public nav: NavController,
              public api: ApiService,
              public alert: AlertController) {
    console.log(this.index);
  }

  ionViewDidLoad() {
    this.loadInfo();
  }

  loadInfo() {
    this.api.get('api/app/index?app=taxi', true).then((response: any) => {
      console.log(response);
      this.index = response;
    });
  }

  openTerminos() {
    this.alert.create({
      message: this.index.terminos.contenido,
      title: "Terminos y condiciones de la oferta",
      mode: 'ios',
      buttons: [
        {
          text: 'Ok gracias !',
          role: 'close'
        }
      ]
    }).present()
  }
}
