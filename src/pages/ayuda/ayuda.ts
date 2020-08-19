import {LoadingController, NavController, ToastController} from 'ionic-angular';
import {Component} from '@angular/core';
import {ApiService} from "../../services/api.service";

@Component({
  selector: 'page-ayuda',
  templateUrl: 'ayuda.html',
})
export class AyudaPage {

  ayudas: any = [];

  constructor(
    public api: ApiService,
    public load: LoadingController,
    public toast: ToastController,
    public nav: NavController) {
  }

  ionViewDidLoad() {
    this.loadContent();
  }

  loadContent() {
    let load = this.load.create({
      content: "Cargando ..."
    });
    load.present();
    this.api.get('/apidriver/app/ayuda?app=rider')
      .then(res => {
        this.ayudas = res;
        load.dismiss();
      }, () => {
        load.dismiss();
        let toast = this.toast.create({
          message: "No hay conexión a internet",
          duration: 4000,
          position: 'top'
        });
        toast.present();
      })
  }
}
