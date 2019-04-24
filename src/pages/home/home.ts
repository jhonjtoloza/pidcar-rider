import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { PlacesPage } from '../places/places';
import { UserPage } from "../user/user";
import { TrackingPage } from '../tracking/tracking';

import { PlaceService } from "../../services/place-service";
import { DealService } from "../../services/deal-service";
import { SettingService } from "../../services/setting-service";
import { DriverService } from "../../services/driver-service";
import { TripService } from "../../services/trip-service";
import {
  DEAL_STATUS_ACCEPTED,
  DEAL_STATUS_PENDING,
  POSITION_INTERVAL,
  SHOW_VEHICLES_WITHIN,
  TRIP_STATUS_FINISHED,
  TRIP_STATUS_GOING,
  TRIP_STATUS_WAITING,
  VEHICLE_LAST_ACTIVE_LIMIT
} from "../../services/constants";
import 'rxjs/Rx'
import { AngularFireAuth } from "angularfire2/auth/auth";
import { AuthService } from "../../services/auth-service";
import * as firebase from 'firebase';

import { TranslateService } from '@ngx-translate/core';
import { PushProvider } from "../../providers/push/push";

declare var google: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  mapId = Math.random() + 'map';
  mapHeight: number = 480;
  showModalBg: boolean = false;
  showVehicles: boolean = false;
  vehicles: any = [];
  currentVehicle: any;
  note: any = '';
  promocode: any = '';
  map: any;
  origin: any;
  destination: any;
  loading: any;
  distance: number = 0;
  duration: number = 0;
  currency: string = '$';
  locality: any;
  paymentMethod: string = 'cash';
  activeDrivers: any[] = [];
  driverMarkers: any[] = [];
  driverTracking: any;
  locateDriver: any = false;
  drivers: any[];
  user = {};
  isTrackDriverEnabled = true;
  discount: any = 0;
  startLatLng: any;
  destLatLng: any;
  bounds: any;
  cardNumber: any;

  distanceText: any = '';
  durationText: any = '';

  constructor(public nav: NavController, public platform: Platform, public alertCtrl: AlertController,
              public placeService: PlaceService, private geolocation: Geolocation,
              public loadingCtrl: LoadingController, public settingService: SettingService,
              public tripService: TripService, public driverService: DriverService, public afAuth: AngularFireAuth,
              public authService: AuthService, public translate: TranslateService,
              public dealService: DealService, private push: PushProvider) {
    this.translate.setDefaultLang('es');
    this.origin = tripService.getOrigin();
    this.destination = tripService.getDestination();

    afAuth.authState.subscribe(authData => {
      if (authData) {
        this.user = authService.getUserData();
      }
    });

  }

  ionViewDidLoad() {
    this.showLoading();
    this.tripService.getTrips().take(1).subscribe(trips => {
      trips.forEach(trip => {
        console.log(trip.status);
        if (trip.status == TRIP_STATUS_WAITING || trip.status == DEAL_STATUS_ACCEPTED || trip.status == TRIP_STATUS_GOING) {
          this.isTrackDriverEnabled = false;
          this.tripService.setId(trip.$key);
          this.nav.setRoot(TrackingPage);
        }
        if (trip.rating == undefined && trip.status == TRIP_STATUS_FINISHED) {
          this.isTrackDriverEnabled = false;
          this.tripService.setId(trip.$key);
          this.nav.setRoot(TrackingPage, {show_card: true});
        }
      })
    });
    this.settingService.getVehicleTypes().then(value => {
      this.vehicles = value;
      this.loadMap();
    });
  }

  ionViewWillLeave() {
    clearInterval(this.driverTracking);
  }

  chooseVehicle(index) {
    for (let i = 0; i < this.vehicles.length; i++) {
      this.vehicles[i].active = (i == index);
      if (i == index) {
        this.tripService.setVehicle(this.vehicles[i]);
        this.currentVehicle = this.vehicles[i];
      }
    }
    this.trackDrivers();
    this.toggleVehicles();
  }

  goProfilePage() {
    this.nav.push(UserPage, {user: this.user});
  }

  loadMap() {
    return this.geolocation.getCurrentPosition().then((resp) => {

      if (this.origin) this.startLatLng = new google.maps.LatLng(this.origin.location.lat, this.origin.location.lng);
      else this.startLatLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);

      let directionsService = new google.maps.DirectionsService();
      let directionsDisplay = new google.maps.DirectionsRenderer();

      this.map = new google.maps.Map(document.getElementById(this.mapId), {
        zoom: 15,
        center: this.startLatLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        zoomControl: false,
        streetViewControl: false,
      });

      let mapx = this.map;
      directionsDisplay.setMap(mapx);
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({'latLng': this.map.getCenter()}, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          if (!this.origin) {
            this.origin = this.placeService.formatAddress(results[0]);
            this.tripService.setOrigin(this.origin.vicinity, this.origin.location.lat, this.origin.location.lng);
            this.setOrigin();
          } else {
            this.setOrigin();
          }

          let locality = this.placeService.setLocalityFromGeocoder(results);
          this.tripService.setCurrency(this.currency);

          if (this.destination && this.destination.location.lat != null) {
            this.placeService.getDirection(this.origin.location.lat, this.origin.location.lng, this.destination.location.lat,
              this.destination.location.lng).subscribe((result: any) => {
              if (result.routes.length) {
                this.distance = result.routes[0].legs[0].distance.value;
                this.distanceText = result.routes[0].legs[0].distance.text;
                this.durationText = result.routes[0].legs[0].duration.text;
              } else {
                this.alertCtrl.create({
                  subTitle: 'Lo sentimos no encontramos conductores disponibles.',
                  buttons: ['OK']
                }).present();
              }
            });
          }

          this.vehicles[0].active = true;
          this.currentVehicle = this.vehicles[0];

          this.locality = locality;
          this.trackDrivers();
        }
      });

      if (this.destination) {
        if (this.destination.location.lat != null) {
          this.destLatLng = new google.maps.LatLng(this.destination.location.lat, this.destination.location.lng);
          let bounds = new google.maps.LatLngBounds();
          bounds.extend(this.startLatLng);
          bounds.extend(this.destLatLng);

          mapx.fitBounds(bounds);
          let request = {
            origin: this.startLatLng,
            destination: this.destLatLng,
            travelMode: google.maps.TravelMode.DRIVING
          };
          directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);
              directionsDisplay.setMap(mapx);
            }
          });
        }
      }
      this.hideLoading();
    }).catch(() => {
      this.hideLoading();

    });
  }

  showPromoPopup() {
    let prompt = this.alertCtrl.create({
      title: 'Enter Promo code',
      message: "",
      inputs: [
        {
          name: 'promocode',
          placeholder: 'Enter Promo Code'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Apply',
          handler: data => {
            firebase.database().ref('promocodes').orderByChild("code").equalTo(data.promocode).once('value', promocodes => {
              let tmp: any = [];
              promocodes.forEach(promo => {
                tmp.push({key: promo.key, ...promo.val()});
                return false;
              });
              tmp = tmp[0];
              if (promocodes.val() != null || promocodes.val() != undefined) {
                this.promocode = tmp.code;
                this.discount = tmp.discount;
                this.tripService.setPromo(tmp.code);
                this.tripService.setDiscount(tmp.discount);
              }
            }, err => console.log(err));
          }
        }
      ]
    });
    prompt.present();
  }


  showNotePopup() {
    let prompt = this.alertCtrl.create({
      title: 'Nota para el conductor',
      message: "",
      inputs: [
        {
          name: 'note',
          placeholder: 'Nota'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: data => {
            this.note = data.note
            this.tripService.setNote(data.note);
          }
        }
      ]
    });
    prompt.present();
  };

  book() {
    this.locateDriver = true;
    console.log("consuctores en book: ", this.activeDrivers.length);
    console.log(this.activeDrivers, this.activeDrivers.slice(0));
    this.tripService.setDistance(this.distance);
    this.tripService.setIcon(this.currentVehicle.icon);
    this.tripService.setNote(this.note);
    this.tripService.setPromo(this.promocode);
    this.tripService.setDiscount(this.discount);
    this.drivers = this.dealService.sortDriversList(this.activeDrivers);
    console.log(this.drivers);
    if (this.drivers.length) {
      this.makeDeal(0);
    } else {
      console.log("lenght = 0");
      this.locateDriver = false;
      this.alertCtrl.create({
        subTitle: 'Lo sentimos no encontramos conductores disponibles.',
        buttons: ['OK']
      }).present();
    }
  }

  makeDeal(index) {
    console.log("makedeal", index, this.drivers);
    let driver = this.drivers[index];
    if (driver) {
      driver.status = 'Bidding';
      this.dealService.getDriverDeal(driver.$key).take(1).subscribe(snapshot => {
        if (snapshot.$value === null) {
          // create a record
          this.dealService.makeDeal(
            driver.$key,
            this.tripService.getOrigin(),
            this.tripService.getDestination(),
            this.tripService.getDistance(),
            this.tripService.getCurrency(),
            this.tripService.getNote(),
            this.tripService.getPromo(),
            this.tripService.getDiscount(),
          ).then(() => {
            this.push.sendNotification('Solicitud de taxi, click para ver los detalles', 'Taxi !!!', driver.app_token);
            let sub = this.dealService.getDriverDeal(driver.$key).subscribe(snap => {
              // if deal expired
              if (snap.$value === null || snap.status != DEAL_STATUS_PENDING) {
                sub.unsubscribe();

                // if deal has been cancelled
                if (snap.$value === null) {
                  this.nextDriver(index);
                  console.log("sext driver");
                } else if (snap.status == DEAL_STATUS_ACCEPTED) {
                  // if deal is accepted
                  this.drivers = [];
                  this.tripService.setId(snap.tripId);
                  this.nav.setRoot(TrackingPage);
                }
              }
            });
          }).catch(err => {
          });
        } else {
          this.nextDriver(index);
        }
      });
    } else {
      // show error & try again button
      this.locateDriver = false;
      this.alertCtrl.create({
        subTitle: 'Lo sentimos no encontramos conductores disponibles.',
        buttons: ['OK']
      }).present();
    }
  }

  nextDriver(index) {
    console.log("next call");
    this.drivers.splice(index, 1);
    this.makeDeal(index);
  }

  chooseOrigin() {
    this.nav.push(PlacesPage, {type: 'origin'});
  }

  chooseDestination() {
    let alert = this.alertCtrl.create({
      title: 'Elegir direccion',
      subTitle: `Si no conoce como elegir la ubicación en el mapa o no es un sitio conocido,
      elija escribir dirección manualmente`,
      buttons: [
        {
          role: 'cancel',
          text: 'Cancelar'
        },
        {
          text: 'Escribir dirección manualmente',
          handler: () => {
            let text = this.alertCtrl.create({
              title: 'Escribir direccion',
              inputs: [
                {
                  name: 'vicinity',
                  placeholder: 'Escriba su dirección de destino',
                  type: 'textarea'
                }
              ],
              buttons: [
                {
                  text: 'Cancelar',
                  role: 'cancel'
                },
                {
                  text: 'Aceptar',
                  handler: (data) => {
                    this.tripService.setDestination(data.vicinity, null, null);
                    this.destination = this.tripService.getDestination();
                  }
                }
              ]
            });
            text.present();
          }
        },
        {
          text: 'Buscar ubicación',
          handler: () => {
            this.nav.push(PlacesPage, {type: 'destination'});
          }
        }
      ]
    });
    alert.present();
  }

  setOrigin() {
    let latLng = new google.maps.LatLng(this.origin.location.lat, this.origin.location.lng);
    let startMarker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });
    startMarker.setMap(this.map);
    if (this.destination && this.destination.location.lat != null)
      startMarker.setMap(null);
    this.map.setCenter(latLng);
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Cargando ...'
    });
    this.loading.present();
  }

  hideLoading() {
    this.loading.dismiss();
  }

  toggleVehicles() {
    this.showVehicles = !this.showVehicles;
    this.showModalBg = (this.showVehicles == true);
  }

  trackDrivers() {
    this.showDriverOnMap(this.locality);
    this.driverTracking = setInterval(() => {
      this.showDriverOnMap(this.locality);
    }, POSITION_INTERVAL);
  }

  showDriverOnMap(locality) {
    console.log("currentVehicle", this.currentVehicle);
    this.driverService.getActiveDriver(locality, this.currentVehicle.id).take(1)
      .subscribe(snapshot => {
        this.clearDrivers();

        snapshot.forEach(vehicle => {
          console.log(vehicle);
          let distance = this.placeService.calcCrow(vehicle.lat, vehicle.lng, this.origin.location.lat, this.origin.location.lng);
          if (distance < SHOW_VEHICLES_WITHIN && Date.now() - vehicle.last_active < VEHICLE_LAST_ACTIVE_LIMIT) {
            let latLng = new google.maps.LatLng(vehicle.lat, vehicle.lng);
            let marker = new google.maps.Marker({
              map: this.map,
              position: latLng,
              icon: {
                url: this.currentVehicle.icon_map,
                size: new google.maps.Size(24, 24),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(16, 16),
                scaledSize: new google.maps.Size(24, 24)
              },
            });
            vehicle.distance = distance;
            this.driverMarkers.push(marker);
            this.activeDrivers.push(vehicle);
          }
        });
      });
  }

  clearDrivers() {
    this.activeDrivers = [];
    this.driverMarkers.forEach((vehicle) => {
      vehicle.setMap(null);
    });
  }
}
