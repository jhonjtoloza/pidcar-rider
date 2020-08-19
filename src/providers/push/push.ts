import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {OneSignal} from "@ionic-native/onesignal";
import {AuthService} from "../../services/auth-service";
import {AlertController, Platform} from "ionic-angular";

/*
  Generated class for the PushProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PushProvider {

  url = "https://fcm.googleapis.com/fcm/send";
  headers;

  constructor(public http: HttpClient, private oneSignal: OneSignal, private alert: AlertController,
              private authService: AuthService, private platform: Platform) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'key=AIzaSyC75XgYfU36Q-UPjsOxn0UwdUcmQswdlwk'
    })
  }

  register() {
    if (this.platform.is('cordova')) {
      this.oneSignal.startInit('7b2c5a65-52f1-4084-b2fc-f07b49f0742c', '927678779355');
      this.oneSignal.getIds().then((value) => {
        this.authService.setPushToken(value.userId);
      }).catch(err => {
      });
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);
      this.oneSignal.handleNotificationReceived().subscribe((value) => {
        this.alert.create({
          title: value.payload.title,
          message: value.payload.body,
          buttons: [
            {
              text: 'OK',
              role: 'cancel'
            }
          ]
        }).present();
      });

      this.oneSignal.handleNotificationOpened().subscribe((value) => {
        this.alert.create({
          title: value.notification.payload.title,
          message: value.notification.payload.body,
          buttons: [
            {
              text: 'OK',
              role: 'cancel'
            }
          ]
        }).present();
      });
      this.oneSignal.endInit();
    }
  }

  sendNotificationDrivers(drivers) {
    let registration_ids = drivers.map((driver) => {
      return driver.app_token;
    });
    console.log(registration_ids);
    let data = {
      registration_ids: registration_ids,
      priority: 10,
      time_to_live: 2000 * 60,
      notification: {
        title: 'Nuevo servicio.',
        body: 'Tenemos un nuevo servicio.',
        android_channel_id: 'taxiService',
        sound: 'sound'
      }
    };
    console.log(JSON.stringify(data));
    this.http.post(this.url, JSON.stringify(data), {
      headers: this.headers
    }).subscribe(data => console.log(data), err => {

    })
  }
}
