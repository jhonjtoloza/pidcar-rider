import {ChangeDetectorRef, Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {Geolocation} from '@ionic-native/geolocation';
import {PlaceService} from "../../services/place-service";
import {TripService} from "../../services/trip-service";
import {TaximetroService} from "../../services/taximetro.service";

declare var google: any;

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  map: any;

  // pin address
  results: any;
  marker: any;

  constructor(public nav: NavController,
              private geolocation: Geolocation,
              public chRef: ChangeDetectorRef,
              public navParams: NavParams,
              public placeService: PlaceService,
              public tripService: TripService,
              public modalCtrl: ViewController,
              private taximetroService: TaximetroService
  ) {
  }

  // Load map only after view is initialized
  ionViewDidLoad() {
    this.loadMap();
  }

  loadMap() {
    // set current location as map center
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: latLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        zoomControl: false,
        streetViewControl: false,
        disableDefaultUI: true,
        fullscreenControl: false,
      });
      // this.marker = new google.maps.Marker({map: this.map, position: latLng, icon: null});
      // this.marker.setMap(this.map);
      // this.map.addListener('center_changed', (event) => {
      //   let center = this.map.getCenter();
      //   this.marker.setPosition(center);
      // })
      // this.map.addListener('drag', (event) => {
      //   let center = this.map.getCenter();
      //   this.marker.setPosition(center);
      // })
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  // find address by LatLng
  findPlace() {
    return new Promise(resolve => {
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({'latLng': this.map.getCenter()}, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          this.results = results;
          resolve();
        }
      });
    });
  }

  // choose address and go back to home page
  selectPlace() {
    this.findPlace().then(() => {
      let address = this.placeService.formatAddress(this.results);
      if (this.navParams.get('type') == 'origin') {
        this.taximetroService.loadTaximetro(this.placeService.getCityName(this.results))
        this.tripService.setOrigin(address.vicinity, address.location.lat, address.location.lng);
      } else {
        this.tripService.setDestination(address.vicinity, address.location.lat, address.location.lng);
      }
      this.modalCtrl.dismiss(address);
    });
  }
}
