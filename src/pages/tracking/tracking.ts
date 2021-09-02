import {Component} from '@angular/core';
import {AlertController, ModalController, NavController, NavParams, Platform} from 'ionic-angular';
import {DriverService} from '../../services/driver-service';
import {HomePage} from "../home/home";
import {TripService} from "../../services/trip-service";
import {
  DEAL_STATUS_ACCEPTED,
  SOS,
  TRIP_STATUS_CANCELED,
  TRIP_STATUS_FINISHED,
  TRIP_STATUS_GOING
} from "../../services/constants";
import {PlaceService} from "../../services/place-service";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {SettingService} from "../../services/setting-service";
import {DealService} from "../../services/deal-service";
import {Market} from "@ionic-native/market";

declare var google: any;

@Component({
  selector: 'page-tracking',
  templateUrl: 'tracking.html'
})
export class TrackingPage {
  driver: any;
  map: any;
  trip: any = {};
  tripId: any;
  driverTracking: any;
  marker: any;
  tripStatus: any;
  sos: any;
  alertCnt: any = 0;

  tripSubscripcion;
  trackDriver;

  constructor(public nav: NavController,
              public driverService: DriverService,
              public platform: Platform,
              public navParams: NavParams,
              public tripService: TripService,
              public placeService: PlaceService,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public iab: InAppBrowser,
              public settings: SettingService,
              public dealService: DealService,
              public market: Market) {
    this.sos = SOS;
    this.isFinish = (this.navParams.get('show_card') === true);
  }

  isFinish = false;

  ionViewDidLoad() {
    this.dealService.getCurrentDeal()
      .take(1)
      .subscribe((value: any) => {
        this.tripId = value.trip_key;
        this.tripService.getTrip(value.trip_key).take(1).subscribe((snapshot: any) => {
          this.trip = snapshot;
          console.log(this.trip);
          this.driverService.getDriver(snapshot.driverId).take(1).subscribe(snap => {
            this.driver = snap;
            if (!this.isFinish) {
              this.watchTrip(value.trip_key);
              this.loadMap();
            } else {
              this.showRateCard();
            }
          })
        });
      });
  }

  watchTrip(tripId) {
    this.tripSubscripcion = this.tripService.getTrip(tripId)
      .subscribe((snapshot: any) => {
        this.trip = snapshot;
        this.tripStatus = snapshot.status;
        if (this.trip.solictud_pago_puntos === 0) {
          this.showSolicitudPago(this.trip.price);
        }
        if (this.tripStatus == TRIP_STATUS_CANCELED) {
          this.tripSubscripcion.unsubscribe();
          this.trackDriver.unsubscribe();
          this.alertCtrl.create({message: 'El viaje ha sido cancelado por el taxista', title: 'Atención!'}).present();
          this.nav.setRoot(HomePage);
        }
        if (this.tripStatus == TRIP_STATUS_FINISHED) {
          this.tripSubscripcion.unsubscribe();
          this.trackDriver.unsubscribe();
          this.showRateCard();
        }
      });
  }

  ratingCard = null;

  showRateCard() {
    if (this.ratingCard == null) {
      let message = `<h3>Valor del servicio: $${this.trip.trip.price}</h3><h3>Puntos ganados: ${this.trip.trip.points_generated}</h3>
                <p>Por favor califica al conductor!</p>`;
      this.ratingCard = this.alertCtrl.create({
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
            this.market.open('com.puntosdorados.cliente');
          }
        }],
      });
      this.ratingCard.present()
    }

  }

  showRatingAlert() {
    console.log(this.trip, this.driver);
    let alert = this.alertCtrl.create({
      title: 'Rate Trip',
      enableBackdropDismiss: false
    });
    alert.addInput({type: 'radio', label: 'Excelente', value: '5', checked: true});
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
        this.showComment(data);
      }
    });
    alert.present();
  }

  showComment(rating) {
    let alert = this.alertCtrl.create({
      title: 'Cuentanos que te parecio el viaje',
      inputs: [
        {
          type: 'textarea',
          name: 'comment',
          placeholder: 'Escribe tu comentario'
        }
      ],
      buttons: [
        {
          text: 'Listo',
          handler: (data) => {
            this.tripService.rateTrip(this.trip.$key, {rating: rating, comment: data.comment}).then(() => {
              this.nav.setRoot(HomePage)
            });
          }
        }
      ]
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
      zoomControl: false,
      streetViewControl: false,
      disableDefaultUI: true,
      fullscreenControl: false
    };
    this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng,
      icon: {
        url: 'https://firebasestorage.googleapis.com/v0/b/taxidriver-23cbd.appspot.com/o/user-placeholder.png?' +
          'alt=media&token=051b73ed-f21d-4624-846b-9cec21b08cf4',
        size: new google.maps.Size(43, 43),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 16),
        scaledSize: new google.maps.Size(43, 43)
      },
    });
    this.showDriverOnMap();
  }

  range(n) {
    return new Array(Math.round(n));
  }

  cancelTrip() {
    this.tripSubscripcion.unsubscribe();
    this.trackDriver.unsubscribe();
    this.tripService.cancelTrip(this.trip.$key).then(data => {
      this.nav.setRoot(HomePage);
    })
  }

  async showSolicitudPago(price) {
    const mesj = `
      <p>
      El conductor: ${this.driver.name} solicita autorización para
           el pago de servicio de taxi.
      </p>
      <h4 style="text-align: center">valor de: ${price} Puntos</h4>`;
    const alert = this.alertCtrl.create({
      title: 'Tarjeta cobro de servicio',
      subTitle: 'Acumule y use los puntos ganados para pagar productos y servicios de puntos dorados' + mesj,
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            this.tripService.confirmPagoPuntos(this.tripId, false);
            return true;
          },
        },
        {
          text: 'Confirmar solicitud de pago',
          handler: () => {
            this.tripService.confirmPagoPuntos(this.tripId);
            return true;
          }
        }
      ],
      enableBackdropDismiss: false
    });
    await alert.present();
  }

  showDriverOnMap() {
    this.trackDriver = this.driverService.getDriverPosition(
      this.driver.uid,
      this.driver.driver_category_id
    ).subscribe((snapshot: any) => {
      if (snapshot.l !== undefined) {
        let latLng = new google.maps.LatLng(snapshot.l[0], snapshot.l[1]);
        if (this.tripStatus == TRIP_STATUS_GOING) {
          this.map.setCenter(latLng);
        }
        if (this.marker !== undefined) {
          this.marker.setPosition(latLng);
        } else {
          this.marker = new google.maps.Marker({
            map: this.map,
            position: latLng,
            icon: {
              url: this.settings.getCategoryIcon(this.driver.driver_category_id),
              size: new google.maps.Size(24, 24),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(16, 16),
              scaledSize: new google.maps.Size(24, 24)
            },
          });
        }
      }
    });
  }

  getTitle() {
    switch (this.trip.status) {
      case TRIP_STATUS_GOING:
        return "Ruta al destino";
      case TRIP_STATUS_FINISHED:
        return "Califica al conductor";
      case DEAL_STATUS_ACCEPTED:
        return "Conductor en camino";
    }
  }
}
