import { Component } from '@angular/core';
import { AlertController, ModalController, NavController, NavParams, Platform } from 'ionic-angular';
import { DriverService } from '../../services/driver-service';
import { HomePage } from "../home/home";
import { TripService } from "../../services/trip-service";
import { SOS, TRIP_STATUS_GOING } from "../../services/constants";
import { PlaceService } from "../../services/place-service";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { SettingService } from "../../services/setting-service";

declare var google: any;

@Component({
  selector: 'page-tracking',
  templateUrl: 'tracking.html'
})
export class TrackingPage {
  driver: any;
  map: any;
  trip: any = {};
  driverTracking: any;
  marker: any;
  tripStatus: any;
  sos: any;
  alertCnt: any = 0;

  constructor(public nav: NavController,
              public driverService: DriverService,
              public platform: Platform,
              public navParams: NavParams,
              public tripService: TripService,
              public placeService: PlaceService,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public iab: InAppBrowser,
              public settings: SettingService) {
    this.sos = SOS;
    this.isFinish = (this.navParams.get('show_card') === true);
  }

  isFinish = false;

  ionViewDidLoad() {
    let tripId;
    if (this.navParams.get('tripId'))
      tripId = this.navParams.get('tripId');
    else
      tripId = this.tripService.getId();

    this.tripService.getTrip(tripId).take(1).subscribe(snapshot => {
      this.trip = snapshot;
      this.driverService.getDriver(snapshot.driverId).take(1).subscribe(snap => {
        console.log("driver: ", snap);
        this.driver = snap;
        if (!this.isFinish) {
          this.watchTrip(tripId);
          this.loadMap();
        } else {
          this.showRateCard();
        }
      })
    });

    this.tripService.getTrip(tripId).subscribe(snapshot => {
      this.trip = snapshot;
    });
  }

  ionViewWillLeave() {
    clearInterval(this.driverTracking);
  }

  watchTrip(tripId) {
    this.tripService.getTrip(tripId).subscribe(snapshot => {
      this.tripStatus = snapshot.status;
    });
  }

  showRateCard() {
    let message = `<h3>Valor del servicio: $${this.trip.trip.price}</h3><h3>Puntos ganados: ${this.trip.trip.points_generated}</h3>`;
    this.alertCtrl.create({
      title: 'Tarjeta final del servicio',
      subTitle: 'Acumule y use los puntos ganados para pagar productos y servicios de puntos dorados.',
      message: message,
      mode: 'ios',
      enableBackdropDismiss: false,
      buttons: [{
        text: 'Califica al conductor',
        handler: () => {
          this.showRatingAlert();
        }
      }, {
        text: 'Decargar la App PuntosDorados',
        handler: () => {
          this.iab.create('https://play.google.com/store/apps/details?id=com.puntosdorados.cliente', '_system')
            .show()
        }
      }],
    }).present();
  }

  showRatingAlert() {
    console.log(this.trip, this.driver);
    let alert = this.alertCtrl.create({
      title: 'Rate Trip',
      enableBackdropDismiss: false
    });
    alert.addInput({type: 'radio', label: 'Excellente', value: '5', checked: true});
    alert.addInput({type: 'radio', label: 'Bueno', value: '4'});
    alert.addInput({type: 'radio', label: 'OK', value: '3'});
    alert.addInput({type: 'radio', label: 'Malo', value: '2'});
    alert.addInput({type: 'radio', label: 'Lo peor', value: '1'});

    alert.addButton({
      text: 'Cancel', handler: () => {
        this.nav.setRoot(HomePage)
      }
    });
    alert.addButton({
      text: 'OK',
      handler: data => {
        this.tripService.rateTrip(this.trip.$key, data).then(() => {
          this.nav.setRoot(HomePage)
        });
      }
    });
    alert.present();

  }

  loadMap() {
    let latLng = new google.maps.LatLng(this.trip.origin.location.lat, this.trip.origin.location.lng);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false
    };

    this.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });

    this.showDriverOnMap();
  }

  // make array with range is n
  range(n) {
    return new Array(Math.round(n));
  }

  cancelTrip() {
    this.tripService.cancelTrip(this.trip.$key).then(data => {
      console.log(data);
      this.nav.setRoot(HomePage);
    })
  }

  // show user on map
  showDriverOnMap() {
    // get user's position
    console.log(this.driver);
    this.driverService.getDriverPosition(
      this.placeService.getLocality(),
      this.driver.driver_category_id,
      this.driver.$key
    ).subscribe(snapshot => {
      // create or update
      console.log("Posicion del conductor", snapshot);
      let latLng = new google.maps.LatLng(snapshot.lat, snapshot.lng);

      if (this.tripStatus == TRIP_STATUS_GOING) {
        console.log(this.tripStatus);
        this.map.setCenter(latLng);
      }

      // show vehicle to map
      if (this.marker !== undefined)
        this.marker.setMap(null);
      this.marker = new google.maps.Marker({
        map: this.map,
        position: latLng,
        icon: {
          url: this.settings.getCategoryIcon(this.driver.driver_category_id),
          size: new google.maps.Size(32, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(16, 16),
          scaledSize: new google.maps.Size(32, 32)
        },
      });
    });
  }
}