import {Component, ViewChild} from '@angular/core';
import {
  AlertController,
  Events,
  FabContainer,
  LoadingController,
  ModalController,
  NavController,
  Platform
} from 'ionic-angular';
import {Geolocation} from '@ionic-native/geolocation';
import {UserPage} from "../user/user";
import {TrackingPage} from '../tracking/tracking';

import {PlaceService} from "../../services/place-service";
import {DealService} from "../../services/deal-service";
import {SettingService} from "../../services/setting-service";
import {DriverService} from "../../services/driver-service";
import {TripService} from "../../services/trip-service";
import {
  DEAL_STATUS_ACCEPTED,
  TRIP_STATUS_FINISHED,
  TRIP_STATUS_GOING,
  TRIP_STATUS_WAITING,
} from "../../services/constants";
import 'rxjs/Rx'
import {AngularFireAuth} from "angularfire2/auth/auth";
import {AuthService} from "../../services/auth-service";

import {TranslateService} from '@ngx-translate/core';
import {PushProvider} from "../../providers/push/push";
import {LocationAccuracy} from '@ionic-native/location-accuracy';
import {HistoryPage} from "../history/history";
import {AyudaPage} from "../ayuda/ayuda";
import {ChatPage} from "../chat/chat";
import {BonusPage} from "../bonus/bonus";
import {PromoPage} from "../promo/promo";
import {PuntosgoldPage} from "../puntosgold/puntosgold";
import {TaximetroService} from "../../services/taximetro.service";
import {OfertaNegociacionPage} from "../oferta-negociacion/oferta-negociacion";
import {MapPage} from "../map/map";
import {TooltipService} from "@teamhive/ngx-tooltip";

declare var google: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  startMarker: any;
  directionsService: any;
  directionsDisplay: any;
  mapId = Math.random() + 'map';
  vehicles: any = [];
  currentVehicle: any;
  note: any = '';
  map: any;
  origin: any;
  destination: any;
  loading: any;
  user: any = {};
  startLatLng: any;
  destLatLng: any;
  passenger: any;
  drivers: any[] = [];
  locateDriver = false;
  markers = [];
  cancelTimer;
  typeViaje = "Taximetro";
  priceTaximetro: number = 0;
  vicinity: '';

  selectOptions: any = {
    title: 'Seleccione una opcion',
    subTitle: 'Seleccione oferta para negociar con el taxista su carrera.',
    cancelText: 'Cancelar'
  };

  menuList: any[] = [
    {label: 'Perfil', icon: 'person', component: UserPage},
    {label: 'Historial', icon: 'list', component: HistoryPage},
    {label: 'Video tutorial', icon: 'videocam', component: AyudaPage},
    {label: 'Chat', icon: 'chatboxes', component: ChatPage},
    {label: 'Bono de inicio', icon: 'ribbon', component: BonusPage},
    {label: 'Donde gastar mis puntos', icon: 'cart', component: PuntosgoldPage},
  ];
  @ViewChild('fab') fabBtn: FabContainer;

  constructor(public nav: NavController, public platform: Platform, public alertCtrl: AlertController,
              public placeService: PlaceService, private geolocation: Geolocation,
              public loadingCtrl: LoadingController, public settingService: SettingService,
              public tripService: TripService, public driverService: DriverService, public afAuth: AngularFireAuth,
              public authService: AuthService, public translate: TranslateService,
              public dealService: DealService, private push: PushProvider, private locationAccuracy: LocationAccuracy,
              private events: Events, public modal: ModalController, private taximetroService: TaximetroService,
              private tooltipService: TooltipService) {
    this.translate.setDefaultLang('es');
    afAuth.authState.subscribe(authData => {
      if (authData) {
        this.user = authService.getUserData();
        authService.getUser(this.user.uid).take(1).subscribe(value => {
          this.passenger = value;
        })
      }
    });
  }

  ionViewDidLoad() {
    this.init();
    this.openPromo();
  }

  async init() {
    let start = await this.checkCurrentTrip();
    if (start){
      this.showLoading();
      if (this.platform.is('cordova')) {
        this.push.register();
        this.locationAccuracy.canRequest().then(() => {
          this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
            () => {
              this.settingService.getVehicleTypes().then(value => {
                this.vehicles = value;
                this.currentVehicle = this.vehicles[0];
                this.loadMap();
              });
            },
            () => {
              this.hideLoading();
              const alert = this.alertCtrl.create({
                message: 'Por favor acepta activar el gps para un correcto funcionamiento.',
                buttons: [
                  {
                    text: 'OK',
                    role: 'cancel'
                  }
                ]
              });
              alert.present();
              alert.onDidDismiss(() => {
                this.init()
              })
            }
          );

        });
      } else {
        this.settingService.getVehicleTypes().then(value => {
          this.vehicles = value;
          this.currentVehicle = this.vehicles[0];
          this.loadMap();
        });
      }
    }
  }

  openMenu() {
    this.events.publish('menu:open');
  }

  checkCurrentTrip() {
    return new Promise(resolve => {
      this.tripService.getTrips().take(1)
        .subscribe((trips: any[]) => {
          let result = trips.reverse();
          if (result.length) {
            let trip = result[0];
            if (trip.status == TRIP_STATUS_WAITING || trip.status == DEAL_STATUS_ACCEPTED || trip.status == TRIP_STATUS_GOING) {
              resolve(false)
              this.tripService.setId(trip.$key);
              this.nav.setRoot(TrackingPage);
            }
            if (trip.rating == undefined && trip.status == TRIP_STATUS_FINISHED) {
              resolve(false)
              this.tripService.setId(trip.$key);
              this.nav.setRoot(TrackingPage, {show_card: true});
            }
          }
          resolve(true)
        });
    })
  }

  // chooseVehicle(index) {
  //   for (let i = 0; i < this.vehicles.length; i++) {
  //     this.vehicles[i].active = (i == index);
  //     if (i == index) {
  //       this.tripService.setVehicle(this.vehicles[i]);
  //       this.currentVehicle = this.vehicles[i];
  //     }
  //   }
  //   this.driverService.startTrack(this.currentVehicle.id, this.origin.lat, this.origin.lng);
  // }

  goProfilePage() {
    this.nav.push(UserPage, {user: this.user});
  }

  async loadMap() {
    let resp = await this.geolocation.getCurrentPosition();
    this.startLatLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
    this.tripService.setOrigin("Cargando ...", resp.coords.latitude, resp.coords.longitude)
    this.map = new google.maps.Map(document.getElementById(this.mapId), {
      zoom: 15,
      center: this.startLatLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      zoomControl: false,
      streetViewControl: false,
      disableDefaultUI: true,
      fullscreenControl: false,
    });

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': this.map.getCenter()}, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        this.taximetroService.loadTaximetro(this.placeService.getCityName(results));
        if (!this.origin) {
          this.origin = this.placeService.formatAddress(results);
          this.vicinity = this.origin.vicinity;
          this.tripService.setOrigin(this.origin.vicinity, this.origin.location.lat, this.origin.location.lng);
          this.setOrigin();
        } else {
          this.setOrigin();
        }
      }
    });
    this.hideLoading();
    this.tooltips();
  }

  tooltips() {
    this.tooltipService.showAll(1000, "dir");
    setTimeout(() => {
      this.tooltipService.hideAll();
      this.tooltipService.showAll(1000, "btn");
      setTimeout(() => this.tooltipService.hideAll(), 8000)
    }, 8000);

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
            this.note = data.note;
            this.tripService.setNote(data.note);
          }
        }
      ]
    });
    prompt.present();
  };

  book() {
    this.locateDriver = true;
    this.tripService.setIcon(this.currentVehicle.icon);
    this.tripService.setNote(this.note);
    if (this.drivers.length) {
      //this.push.sendNotificationDrivers(this.drivers);
      this.dealService.makeDeal(this.currentVehicle.id, this.origin, this.destination, this.note, this.passenger, this.tripService.getOferta(), this.typeViaje, this.priceTaximetro);
      if (this.typeViaje == 'Taximetro') {
        this.cancelTimer = setTimeout(() => {
          this.cancelBook();
          this.showNoFound();
        }, 60 * 2000);

        let sub = this.dealService.getCurrentDeal().subscribe(value => {
          if (value.status == TRIP_STATUS_WAITING) {
            clearTimeout(this.cancelTimer);
            sub.unsubscribe();
            this.tripService.setId(value.trip_key);
            this.nav.setRoot(TrackingPage);
          }
        });
      } else {
        const modal = this.modal.create(OfertaNegociacionPage, null, {
          cssClass: 'modal-negociacion'
        });
        modal.present()
        modal.onDidDismiss(data => {
          console.log(data);
          if (data === false) {
            this.locateDriver = false;
          } else {
            let load = this.loadingCtrl.create({
              content: 'Esperando confirmaci??n del conductor',
              dismissOnPageChange: true
            })
            load.present();
            let sub = this.dealService.getCurrentDeal().subscribe(value => {
              if (value.status == TRIP_STATUS_WAITING) {
                clearInterval(this.cancelTimer);
                sub.unsubscribe();
                this.tripService.setId(value.trip_key);
                this.nav.setRoot(TrackingPage);
              }
            });
          }
        })
      }
    } else {
      this.showNoFound();
    }
  }

  showNoFound() {
    this.locateDriver = false;
    this.alertCtrl.create({
      subTitle: 'Lo sentimos no encontramos conductores disponibles.',
      buttons: ['OK']
    }).present();
  }

  cancelBook() {
    clearTimeout(this.cancelTimer);
    this.locateDriver = false;
    this.dealService.getCurrentDeal().remove();
  }

  chooseOrigin() {
    this.openModalDestination('origin');
  }

  chooseDestination() {
    let alert = this.alertCtrl.create({
      title: 'Elegir direccion',
      subTitle: `Si no conoce como elegir la ubicaci??n en el mapa o no es un sitio conocido,
      elija escribir direcci??n manualmente, si desea conocer el precio aproximado de su viaje seleccione una ubicaci??n GPS`,
      buttons: [
        {
          role: 'cancel',
          text: 'Cancelar'
        },
        {
          text: 'Escribir direcci??n manualmente',
          handler: () => {
            let text = this.alertCtrl.create({
              title: 'Escribir direccion',
              inputs: [
                {
                  name: 'vicinity',
                  placeholder: 'Escriba su direcci??n de destino',
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
                    this.setRoute()
                  }
                }
              ]
            });
            text.present();
          }
        },
        {
          text: 'Buscar ubicaci??n GPS',
          handler: () => {
            this.openModalDestination('destination');
          }
        }
      ]
    });
    alert.present();
  }

  openModalDestination(type) {
    let modal = this.modal.create(MapPage, {type: type});
    modal.present();
    modal.onDidDismiss(data => {
      if (type == 'origin') {
        this.origin = this.tripService.getOrigin();
        this.startLatLng = new google.maps.LatLng(this.origin.location.lat, this.origin.location.lng);
        this.setOrigin();
        this.driverService.startTrack(this.currentVehicle.id, this.origin.location.lat, this.origin.location.lng);
        this.showDriversInMap();
      } else {
        this.destination = this.tripService.getDestination();
        this.setRoute()
      }
    })
  }

  setRoute() {
    if (this.directionsDisplay){
      this.directionsDisplay.setMap(null);
      this.directionsDisplay = null;
      this.map.setCenter(this.startMarker.getPosition())
    }
    if (this.destination && this.destination.location.lat != null) {
      this.directionsService = new google.maps.DirectionsService();
      this.directionsDisplay = new google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeColor: '#ffa200',
          strokeOpacity: 1.0,
          strokeWeight: 4
        },
      });
      this.directionsDisplay.setMap(this.map);

      this.placeService.getDirection(this.origin.location.lat, this.origin.location.lng, this.destination.location.lat,
        this.destination.location.lng).subscribe((result: any) => {
        if (result.routes.length) {
          this.tripService.setDistance(result.routes[0].legs[0].distance);
          this.tripService.setDuration(result.routes[0].legs[0].duration);
          this.priceTaximetro = this.taximetroService.calculatePrice();
        } else {
          this.alertCtrl.create({
            subTitle: 'Lo sentimos no encontramos una ruta disponible.',
            buttons: ['OK']
          }).present();
        }
      });
      this.destLatLng = new google.maps.LatLng(this.destination.location.lat, this.destination.location.lng);

      let bounds = new google.maps.LatLngBounds();
      bounds.extend(this.startLatLng);
      bounds.extend(this.destLatLng);
      this.map.fitBounds(bounds);
      // let point = this.map.getCenter();
      // let projection = this.map.getProjection();
      // let pixelpoint = projection.fromLatLngToPoint(point);
      // pixelpoint.y = pixelpoint.y - 600;
      // let newpoint = projection.fromPointToLatLng(pixelpoint);
      // this.map.setCenter(newpoint)
      let request = {
        origin: this.startLatLng,
        destination: this.destLatLng,
        travelMode: google.maps.TravelMode.DRIVING
      };
      this.directionsService.route(request, (response, status) => {
        if (status == google.maps.DirectionsStatus.OK) {
          console.log(response);
          this.directionsDisplay.setDirections(response);
          this.directionsDisplay.setMap(this.map);
        }
      });
    }
  }

  setOrigin() {
    let latLng = new google.maps.LatLng(this.origin.location.lat, this.origin.location.lng);

    this.vicinity = this.origin.vicinity;
    if (!this.startMarker) {
      this.startMarker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });
      this.startMarker.setMap(this.map);
      this.map.setCenter(latLng);
    } else {
      this.startMarker.setPosition(latLng);
      this.map.setCenter(latLng)
    }
    this.driverService.startTrack(this.currentVehicle.id, this.origin.location.lat, this.origin.location.lng)
    this.showDriversInMap();
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

  showDriversInMap() {
    this.driverService.getActiveDrivers().subscribe(value => {
      this.drivers = value;
      this.markers.forEach(marker => {
        marker.setMap(null);
      });
      this.markers = [];
      this.drivers.forEach((driver) => {
        const marker = new google.maps.Marker({
          map: this.map,
          position: new google.maps.LatLng(driver.location.lat, driver.location.lng),
          icon: {
            url: this.currentVehicle.icon_map,
            size: new google.maps.Size(24, 24),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(16, 16),
            scaledSize: new google.maps.Size(24, 24)
          },
        });
        this.markers.push(marker);
      });
    })
  }

  openPromo() {
    let show = localStorage.getItem('hidden-promo');
    if (show == null || show == 'false') {
      this.modal.create(PromoPage, null, {
        cssClass: 'promo'
      }).present()
    }
  }

  goPage(item) {
    console.log(this.fabBtn);
    this.fabBtn.close();
    this.nav.push(item.component);
  }

  setTypeViaje(e) {
    this.tripService.setTypeViaje(e);
    if (e == 'Oferta') {
      this.ofertar();
    }
  }

  ofertar() {
    let alert = this.alertCtrl.create({
      title: 'Por favor me puede llevar por el siguiente valor, ' +
        (this.taximetroService.taximetro !== null ? ('Minimo ' + this.taximetroService.getMinValor()) : ''),
      inputs: [
        {
          label: '??Cuanto ofreces?',
          placeholder: '??Cuanto ofreces?',
          name: 'oferta',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            this.tripService.setTypeViaje('Taximetro');
            this.typeViaje = 'Taximetro';
          }
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (data.oferta >= this.taximetroService.getMinValor()) {
              this.tripService.setOferta(data.oferta)
            } else {
              this.ofertar();
            }
          }
        }
      ]
    });
    alert.present();
  }

  setTextVicinity() {
    this.tripService.setOrigin(this.origin.vicinity, this.origin.location.lat, this.origin.location.lng)
  }
}
