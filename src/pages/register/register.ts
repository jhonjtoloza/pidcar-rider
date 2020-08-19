import {Component} from '@angular/core';
import {AlertController, LoadingController, NavController} from 'ionic-angular';
import {LoginPage} from '../login/login';
import {HomePage} from "../home/home";
import {AuthService} from "../../services/auth-service";
import {TranslateService} from '@ngx-translate/core';
import {ApiService} from "../../services/api.service";
import {InAppBrowser} from "@ionic-native/in-app-browser";

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
      this.alertCtrl.create({
        subTitle: 'Ingrese todos sus datos, y acepte los terminos y condiciones',
        buttons: ['ok']
      }).present();
    } else {
      console.log("password", this.password.length);
      if (this.password.length < 6) {
        this.alertCtrl.create({
          subTitle: 'La contraseña debe tener minimo 6 caracteres',
          buttons: ['ok']
        }).present();
      } else {
        let loading = this.loadingCtrl.create({content: 'Creando cuenta...'});
        loading.present();
        this.authService.register(this.email, this.password, this.name, this.phoneNumber).subscribe(authData => {
          console.log("Cuenta creada");
          let body = {
            documento: this.document,
            nombres: this.name,
            email: this.email,
            access_token: authData.uid,
            password: this.password,
            codetaxi: this.codetaxi
          };
          this.api.post('api/auth/sign-up-pd', body)
            .then((value: any) => {
              this.authService.setPDUser(value);
              loading.dismiss();
              this.nav.setRoot(HomePage);
            }).catch((err) => {
            this.authService.delete();
            this.alertCtrl.create({
              message: err.message,
              buttons: ['OK']
            }).present()
          });
        }, (err) => {
          let mensaje = '';
          console.log(err);
          if (err.code == 'auth/email-already-in-use') {
            mensaje = 'El correo ya se encuentra registrado, intente usar otro correo';
          } else if (err.code == "auth/network-request-failed") {
            mensaje = `Sin acceso a internet, asegurece de tener datos o una conexión wifi, 
            recuerde que debe tener acceso permanente a internet para usar pd taxi`
          }

          loading.dismiss();
          let alert = this.alertCtrl.create({
            message: mensaje,
            buttons: ['OK']
          });
          alert.present();
        });
      }
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
