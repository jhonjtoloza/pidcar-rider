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
              public dealService: DealService) {
    this.translate.setDefaultLang('en');
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
    this.tripService.getTrips().subscribe(trips => {
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

      let directionsDisplay;
      let directionsService = new google.maps.DirectionsService();
      directionsDisplay = new google.maps.DirectionsRenderer();

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
          console.log('locality', locality);
          this.tripService.setCurrency(this.currency);

          if (this.destination) {
            this.placeService.getDirection(this.origin.location.lat, this.origin.location.lng, this.destination.location.lat,
              this.destination.location.lng).subscribe((result: any) => {
              console.log(result);
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
          if (this.isTrackDriverEnabled)
            this.trackDrivers();
        }
      });

      if (this.destination) {
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
            console.log(response);
            directionsDisplay.setDirections(response);
            directionsDisplay.setMap(mapx);
          } else {
            console.log("error");
          }
        });
      }
      this.hideLoading();
    }).catch((error) => {
      this.hideLoading();
      console.log('Error getting location', error);
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
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Apply',
          handler: data => {
            console.log(data.promocode);
            firebase.database().ref('promocodes').orderByChild("code").equalTo(data.promocode).once('value', promocodes => {
              console.log(promocodes.val());
              let tmp: any = [];
              promocodes.forEach(promo => {
                tmp.push({key: promo.key, ...promo.val()});
                return false;
              });
              tmp = tmp[0];
              console.log(tmp);
              if (promocodes.val() != null || promocodes.val() != undefined) {
                this.promocode = tmp.code;
                this.discount = tmp.discount;
                this.tripService.setPromo(tmp.code);
                this.tripService.setDiscount(tmp.discount);
                console.log('promo applied', tmp.code, tmp.discount);
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
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Guardar',
          handler: data => {
            this.note = data;
            this.tripService.setNote(data);
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
  };

  book() {
    this.locateDriver = true;
    console.log("consuctores en book: ", this.activeDrivers.length);
    console.log(this.activeDrivers);

    this.tripService.setAvailableDrivers(this.activeDrivers.slice(0));
    this.tripService.setDistance(this.distance);
    this.tripService.setIcon(this.currentVehicle.icon);
    this.tripService.setNote(this.note);
    this.tripService.setPromo(this.promocode);
    this.tripService.setDiscount(this.discount);
    this.drivers = this.tripService.getAvailableDrivers();

    console.log("drivers after: ", this.drivers.length);
    console.log(this.drivers);

    this.drivers = this.dealService.sortDriversList(this.drivers.slice(0));
    console.log("driver after sort", this.drivers.length);
    console.log(this.drivers);
    if (this.drivers.length) {
      this.makeDeal(0);
    } else {
      console.log("lenght = 0");
    }

  }

  makeDeal(index) {
    let driver = this.drivers[index];
    console.log(this.drivers);
    console.log("driver in makedeal", driver);
    if (driver) {
      console.log("Ingreso en el if");
      driver.status = 'Bidding';
      this.dealService.getDriverDeal(driver.$key).take(1).subscribe(snapshot => {
        if (snapshot.$value === null) {
          // create a record
          console.log(snapshot);
          console.log("Valor de descuento", this.tripService.getDiscount());
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
            let sub = this.dealService.getDriverDeal(driver.$key).subscribe(snap => {
              // if record doesn't exist or is accepted
              if (snap.$value === null || snap.status != DEAL_STATUS_PENDING) {
                sub.unsubscribe();

                // if deal has been cancelled
                if (snap.$value === null) {
                  this.nextDriver(index);
                } else if (snap.status == DEAL_STATUS_ACCEPTED) {
                  // if deal is accepted
                  console.log('accepted', snap.tripId);
                  this.drivers = [];
                  this.tripService.setId(snap.tripId);
                  this.nav.setRoot(TrackingPage);
                }
              }
            });
          }).catch(err => {
            console.log("error haciendo makedeal", err);
          });
        } else {
          this.nextDriver(index);
        }
      });
    } else {
      // show error & try again button
      console.log('No user found');
      this.locateDriver = false;
      this.alertCtrl.create({
        subTitle: 'Lo sentimos no encontramos conductores disponibles.',
        buttons: ['OK']
      }).present();
    }
  }

  nextDriver(index) {
    this.drivers.splice(index, 1);
    this.makeDeal(index);
  }

  chooseOrigin() {
    this.nav.push(PlacesPage, {type: 'origin'});
  }

  chooseDestination() {
    this.nav.push(PlacesPage, {type: 'destination'});
  }

  setOrigin() {
    let latLng = new google.maps.LatLng(this.origin.location.lat, this.origin.location.lng);
    let startMarker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });
    startMarker.setMap(this.map);
    if (this.destination)
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
    clearInterval(this.driverTracking);

    this.driverTracking = setInterval(() => {
      this.showDriverOnMap(this.locality);
    }, POSITION_INTERVAL);

    console.log(POSITION_INTERVAL);
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
            console.log("Vehiculo agregado:", this.activeDrivers.length);
          }
        });
      });
  }

  clearDrivers() {
    console.log("se limpian conductores");
    this.activeDrivers = [];
    this.driverMarkers.forEach((vehicle) => {
      vehicle.setMap(null);
    });
  }
}
