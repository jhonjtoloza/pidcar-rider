import {Component, ViewChild} from '@angular/core';
import {AlertController, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
// import pages
import {LoginPage} from '../pages/login/login';
import {HomePage} from '../pages/home/home';

import {AngularFireAuth} from "angularfire2/auth/auth";
import {AuthService} from "../services/auth-service";
import {UserPage} from "../pages/user/user";

import {TranslateService} from '@ngx-translate/core';
import {ApiService} from "../services/api.service";
import {Market} from '@ionic-native/market';


// end import pages

@Component({
  templateUrl: 'app.html',
  queries: {
    nav: new ViewChild('content')
  }
})

export class MyApp {
  rootPage: any;
  nav: any;
  user = {};
  private version = '2.7.6';

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public afAuth: AngularFireAuth,
              public authService: AuthService, public translate: TranslateService,
              public api: ApiService, private alertCtl: AlertController, private market: Market) {
    api.get('apidriver/app/version-rider?v=' + this.version, false).then(checked => {
      if (!checked) {
        let alert = this.alertCtl.create({
          title: 'Atención !!',
          subTitle: 'Hay una nueva versión disponible, para mejor funcionalidad por favor actualice su applicación',
          buttons: [
            {
              role: 'cancel',
              text: 'OK'
            }
          ]
        });
        alert.present();
        alert.onDidDismiss(() => {
          this.market.open('com.pd.rider');
        });
      }
    });
    this.translate.use(this.translate.getBrowserLang());
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
      afAuth.authState.take(1).subscribe(authData => {
        if (authData) {
          this.authService.getUser(authData.uid).take(1)
            .subscribe((value: any) => {
              if (value.$exists()) {
                this.api.post('api/auth/login-by-token', {access_token: authData.uid}).then(value => {
                  this.authService.setPDUser(value);
                  this.nav.setRoot(HomePage);
                }).catch(() => {
                  this.authService.logout();
                });
              } else {
                this.nav.setRoot(LoginPage);
              }
            });
        } else {
          this.nav.setRoot(LoginPage);
        }
      });
      afAuth.authState.subscribe(authData => {
        if (authData) {
          this.user = authService.getUserData();
        }
      });
    });
  }

  viewProfile() {
    this.nav.push(UserPage, {
      user: this.user
    });
  }
}
