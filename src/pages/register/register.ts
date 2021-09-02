import {Component} from '@angular/core';
import {AlertController, LoadingController, NavController} from 'ionic-angular';
import {LoginPage} from '../login/login';
import {HomePage} from "../home/home";
import {AuthService} from "../../services/auth-service";
import {TranslateService} from '@ngx-translate/core';
import {ApiService} from "../../services/api.service";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {
  model: FormGroup;
  type = 'password';
  acepto = false;


  constructor(
    public nav: NavController,
    public authService: AuthService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public api: ApiService,
    public iab: InAppBrowser,
    private form: FormBuilder) {
    this.model = this.form.group({
      email: new FormControl('', {
        updateOn: 'blur',
        validators: [Validators.required, Validators.email]
      }),
      password: new FormControl('', {
        updateOn: 'blur',
        validators: [Validators.required, Validators.minLength(6)]
      }),
      name: new FormControl('', {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      phoneNumber: new FormControl('', {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      document: new FormControl('', {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      codetaxi: new FormControl('', {
        updateOn: 'blur'
      }),
      acepto: new FormControl(false, {
        updateOn: 'blur',
        validators: [Validators.requiredTrue]
      })
    })
  }

  signup(e) {
    e.preventDefault();
    if (this.model.valid) {
      let loading = this.loadingCtrl.create({content: 'Creando cuenta...'});
      loading.present();
      this.authService.register(this.model.controls.email.value, this.model.controls.password.value, this.model.controls.name.value,
        this.model.controls.phoneNumber.value).subscribe(authData => {
        console.log("Cuenta creada");
        let body = {
          documento: this.model.controls.document.value,
          nombres: this.model.controls.name.value,
          email: this.model.controls.email.value,
          access_token: authData.uid,
          password: this.model.controls.password.value,
          codetaxi: this.model.controls.codetaxi.value
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
        recuerde que debe tener acceso permanente a internet para usar PidCar`
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
