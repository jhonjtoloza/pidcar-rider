import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController, ToastController } from 'ionic-angular';
import { RegisterPage } from '../register/register';
import { HomePage } from '../home/home'
import { AuthService } from "../../services/auth-service";
import * as firebase from 'firebase';
import { ENABLE_SIGNUP } from '../../services/constants';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from "../../services/api.service";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  email: string = "";
  password: string = "";
  isRegisterEnabled: any = true;
  type = 'password';

  constructor(
    public nav: NavController,
    public authService: AuthService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public toast: ToastController,
    public translate: TranslateService,
    public api: ApiService) {
    this.isRegisterEnabled = ENABLE_SIGNUP;
  }

  signup() {
    this.nav.setRoot(RegisterPage);
  }

  reset() {
    let reset = this.alertCtrl.create({
      title: 'Recuperar contraseña',
      inputs: [
        {
          name: 'email',
          label: 'Ingrese su email'
        }
      ],
      buttons: [
        {role: 'cancel', text: 'Cancelar'},
        {role: 'ok', text: 'Confirmar'}
      ]
    });
    reset.present();
    reset.onDidDismiss(data => {
      if (data.email.length)
        firebase.auth().sendPasswordResetEmail(data.email)
          .then(() =>
            this.toast.create({message: 'Revisa tu email para recuperar tu contraseña', duration: 3000}).present())
          .catch(err => this.toast.create({
            message: "Correo no registrado o mal ingresado intente nuevamente",
            duration: 3000
          }).present())
    });
  }

  login() {
    if (this.email.length == 0 || this.password.length == 0) {
      this.alertCtrl.create({subTitle: 'Datos invalidos', buttons: ['ok']}).present();
    }
    else {
      let loading = this.loadingCtrl.create({content: 'Autenticando ...'});
      loading.present();
      this.authService.login(this.email, this.password).then(authData => {
        loading.setContent('Verificando cuenta en puntos darados');
        this.api.post('api/auth/login-by-token', {access_token: authData.uid}).then(value => {
          loading.dismiss();
          this.authService.setPDUser(value)
        }).catch(() => {
          this.authService.logout();
          loading.dismiss();
          this.alertCtrl.create({
            message: 'Su cuenta no pudo ser verificada en puntos dorados, contacte a atención al cliente'
          })
        });
        this.nav.setRoot(HomePage);
      }, error => {
        // in case of login error
        loading.dismiss();
        let alert = this.alertCtrl.create({
          message: "Datos de ingreso invalidos",
          buttons: ['OK']
        });
        alert.present();
      });
    }

  }

  toggle() {
    if (this.type == 'password')
      this.type = 'email';
    else
      this.type = 'password';
  }
}