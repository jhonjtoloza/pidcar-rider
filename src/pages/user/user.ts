import {Component} from '@angular/core';
import {AlertController, LoadingController, NavController, NavParams, Platform, ToastController} from 'ionic-angular';

import {LoginPage} from '../login/login';
import {HomePage} from "../home/home";

import {AuthService} from "../../services/auth-service";
import {TranslateService} from '@ngx-translate/core';

import firebase from 'firebase';
import 'rxjs/add/operator/map';
import {ApiService} from "../../services/api.service";
import {SocialSharing} from "@ionic-native/social-sharing";


declare var Stripe: any;

@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})
export class UserPage {
  user: any = {photoURL: 'http://placehold.it/50x50'};
  tripCount = 0;
  totalSpent = 0;
  tabs: any = 'profile';
  trips: Array<any>;
  number: any;
  exp: any;
  cvv: any;
  afiliado: any = {};

  mensaje: any = 'quiero invitarte a pertenecer al club Puntos Dorados y PidCar, Gana puntos por tus compras y carreras, Gana puntos por ' +
    'las compras de tus amigos, compra con dinero o con tus puntos en cientos de negocios cerca en tu ciudad y participa' +
    ' por premios.';

  constructor(public nav: NavController, public authService: AuthService, public navParams: NavParams, public alertCtrl: AlertController,
              public toastCtrl: ToastController, public loadingCtrl: LoadingController, public platform: Platform,
              public translate: TranslateService,
              private api: ApiService, private socialShare: SocialSharing) {
    let userx = this.authService.getUserData();
    this.authService.getUser(userx.uid).take(1).subscribe((snapshot: any) => {
      snapshot.uid = snapshot.$key;
      this.user = snapshot;
      this.user.isEmailVerified = firebase.auth().currentUser.emailVerified;
      console.log(this.user);
    });
    authService.getCardSetting().take(1).subscribe((snapshot: any) => {
      this.number = snapshot.number;
      this.exp = snapshot.exp;
      this.cvv = snapshot.cvv;
    });
    this.api.get('api/app', true).then((value: any) => {
      this.afiliado = value;
    })
  }

  // save user info
  save() {
    this.authService.updateUserProfile(this.user);
    this.nav.pop();
    this.displayToast("Profile has been updated");
  }

  // choose file for upload
  chooseFile() {
    document.getElementById('avatar').click();
  }

  // upload thumb for item
  upload() {
    // Create a root reference
    let storageRef = firebase.storage().ref();
    let loading = this.loadingCtrl.create({content: 'Please wait...'});
    loading.present();

    for (let selectedFile of [(<HTMLInputElement>document.getElementById('avatar')).files[0]]) {
      let path = '/users/' + Date.now() + `${selectedFile.name}`;
      let iRef = storageRef.child(path);
      iRef.put(selectedFile).then((snapshot) => {
        loading.dismiss();
        this.user.photoURL = snapshot.downloadURL;
      });
    }
  }

  logout() {
    this.authService.logout().then(() => {
      this.nav.setRoot(LoginPage);
    });
  }


  verifyEmail() {
    firebase.auth().currentUser.sendEmailVerification().then(data => {
      this.displayToast("Please check your inbox");
    }).catch(err => console.log(err));
  }

  displayToast(message) {
    this.toastCtrl.create({duration: 2000, message}).present();
  }


  // save card settings
  saveCard() {
    const exp = this.exp.split('/');
    const loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    Stripe.card.createToken({
      number: this.number,
      exp_month: exp[0],
      exp_year: exp[1],
      cvc: this.cvv
    }, (status: number, response: any) => {
      loading.dismiss();
      // success
      if (status == 200) {
        // if nav from payment method selection
        if (this.navParams.get('back')) {
          this.nav.pop();
        } else {
          this.nav.setRoot(HomePage);
        }

        this.authService.updateCardSetting(this.number, this.exp, this.cvv, response.id);
        let toast = this.toastCtrl.create({
          message: 'Your card setting has been updated',
          duration: 3000,
          position: 'middle'
        });
        toast.present();
      } else {
        // error
        let alert = this.alertCtrl.create({
          title: 'Error',
          subTitle: response.error.message,
          buttons: ['OK']
        });
        alert.present();
      }
    });
  }


  share() {
    this.socialShare.share(this.mensaje + " Usa mi codigo al registrarte" +
      this.authService.pdUSer.code +
      ' Descarga la app: http://bit.ly/PidCar')
      .then(function (data) {
        console.log("Compartido ..." + data)
      })
  }
}
