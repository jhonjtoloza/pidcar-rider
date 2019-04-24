import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { HomePage } from "../home/home";
import { AuthService } from "../../services/auth-service";
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from "../../services/api.service";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";

@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {
  email: string = "";
  password: string = "";
  name: string = "";
  phoneNumber: string = "";
  document: string = "";
  codetaxi: string = '';
  type = 'password';
  acepto = false;


  constructor(
    public nav: NavController,
    public authService: AuthService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public api: ApiService,
    public iab: InAppBrowser) {
  }

  signup() {
    if (this.email.length == 0 || this.password.length == 0 || this.name.length == 0 || this.phoneNumber.length == 0 && !this.acepto) {
      this.alertCtrl.create({subTitle: 'Ingrese todos sus datos, y acepte los terminos y condiciones', buttons: ['ok']}).present();
    }
    else {
      let loading = this.loadingCtrl.create({content: 'Creando cuenta...'});
      loading.present();
      this.authService.register(this.email, this.password, this.name, this.phoneNumber).subscribe(authData => {
        console.log("Cuenta creada");
        this.api.post('api/auth/sign-up-pd', {
          documento: this.document,
          nombres: this.name,
          email: this.email,
          access_token: authData.uid,
          password: this.password,
          codetaxi: this.codetaxi
        }).then((value: any) => {
          this.authService.setPDUser(value);
          loading.dismiss();
          this.nav.setRoot(HomePage);
        }).catch(() => {
          this.alertCtrl.create({
            message: 'Ocurrio un error al crear su cuenta por favor intente nuevamente'
          })
        });
      }, () => {
        loading.dismiss();
        let alert = this.alertCtrl.create({
          message: '',
          buttons: ['OK']
        });
        alert.present();
      });
    }

  }

  login() {
    this.nav.setRoot(LoginPage);
  }

  toggle() {
    if (this.type == 'password')
      this.type = 'email';
    else
      this.type = 'password';
  }

  launch() {
    this.iab.create('http://puntosdorados.com/site/terminos?page=app-rider', '_system');
  }
}
