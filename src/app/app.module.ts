import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {MyApp} from './app.component';
import {BrowserModule} from '@angular/platform-browser';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {HttpModule} from '@angular/http';
import {Geolocation} from '@ionic-native/geolocation';
import {IonicStorageModule} from '@ionic/storage';
// Import the AF2 Module
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFireAuthModule} from 'angularfire2/auth';
// Import moment module
import {MomentModule} from 'angular2-moment';
// import services
import {DriverService} from '../services/driver-service';

import {PlaceService} from '../services/place-service';
import {TripService} from '../services/trip-service';
import {SettingService} from "../services/setting-service";
import {DealService} from "../services/deal-service";
import {AuthService} from "../services/auth-service";


import {HomePage} from '../pages/home/home';
import {LoginPage} from '../pages/login/login';
import {PlacesPage} from '../pages/places/places';
import {RegisterPage} from '../pages/register/register';
import {TrackingPage} from '../pages/tracking/tracking';
import {MapPage} from "../pages/map/map";
import {UserPage} from '../pages/user/user';

import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {ApiService} from "../services/api.service";
import {AyudaPage} from "../pages/ayuda/ayuda";
import {PipesModule} from "../pipes/pipes.module";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {PushProvider} from '../providers/push/push';
import {OneSignal} from "@ionic-native/onesignal";
import {LocationAccuracy} from '@ionic-native/location-accuracy';
import {Market} from '@ionic-native/market';
import {HistoryPageModule} from "../pages/history/history.module";
import {BonusPageModule} from "../pages/bonus/bonus.module";
import {ChatPageModule} from "../pages/chat/chat.module";
import {PromoPageModule} from "../pages/promo/promo.module";
import {PuntosgoldPageModule} from "../pages/puntosgold/puntosgold.module";
import {SocialSharing} from "@ionic-native/social-sharing";
import {TaximetroService} from "../services/taximetro.service";
import {OfertaNegociacionPageModule} from "../pages/oferta-negociacion/oferta-negociacion.module";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/lang/', '.json');
}

export const firebaseConfig = {
  apiKey: "AIzaSyAf3s1qepgZT9W6BYv5NkhXw5IMONrsDCE",
  authDomain: "taxidriver-23cbd.firebaseapp.com",
  databaseURL: "https://taxidriver-23cbd.firebaseio.com",
  projectId: "taxidriver-23cbd",
  storageBucket: "taxidriver-23cbd.appspot.com",
  messagingSenderId: "927678779355",
  automaticDataCollectionEnabled: false
};


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    PlacesPage,
    RegisterPage,
    TrackingPage,
    MapPage,
    UserPage,
    AyudaPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    MomentModule,
    PipesModule,
    HistoryPageModule,
    BonusPageModule,
    ChatPageModule,
    PromoPageModule,
    PuntosgoldPageModule,
    OfertaNegociacionPageModule,
    IonicModule.forRoot(MyApp, {
      mode: 'ios',
      backButtonText: ''
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    PlacesPage,
    RegisterPage,
    TrackingPage,
    MapPage,
    UserPage,
    AyudaPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    DriverService,
    PlaceService,
    TripService,
    SettingService,
    DealService,
    AuthService,
    ApiService,
    InAppBrowser,
    PushProvider,
    OneSignal,
    LocationAccuracy,
    Market,
    SocialSharing,
    TaximetroService,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
  ]
})
export class AppModule {
}
