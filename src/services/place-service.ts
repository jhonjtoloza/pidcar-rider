import {Injectable} from "@angular/core";
import {GOOGLE_MAP_API_KEY, GOOGLE_MAP_BASE_URL} from './constants'

import 'rxjs/add/operator/map'
import {HttpClient} from "@angular/common/http";

@Injectable()
export class PlaceService {
  public city;

  private baseUrl: any;
  private apiKey: any;

  constructor(public http: HttpClient) {
    this.baseUrl = GOOGLE_MAP_BASE_URL;
    this.apiKey = GOOGLE_MAP_API_KEY;
  }

  // search by address
  searchByAddress(address, lat, lng) {
    let url = this.baseUrl + 'place/nearbysearch/json?key=' + this.apiKey
      + '&keyword=' + encodeURI(address)
      + '&location=' + lat + ',' + lng
      + '&radius=50000';
    return this.http.get(url);
  }

  // get direction between to points
  getDirection(lat1, lon1, lat2, lon2) {
    let url = this.baseUrl + 'directions/json?key=' + this.apiKey
      + '&origin=' + lat1 + ',' + lon1
      + '&destination=' + lat2 + ',' + lon2;
    return this.http.get(url);
  }


  //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
  calcCrow(lat1, lon1, lat2, lon2) {
    let R = 6371; // km
    let dLat = this.toRad(lat2 - lat1);
    let dLon = this.toRad(lon2 - lon1);
    lat1 = this.toRad(lat1);
    lat2 = this.toRad(lat2);

    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;

    return d;
  }

  // Converts numeric degrees to radians
  toRad(value) {
    return value * Math.PI / 180;
  }

  /**
   * Convert geocoder address to place object
   * @param results: Geocoder address result
   * @returns {{location: {lat: any, lng: any}, vicinity: string}}
   */
  formatAddress(results) {
    let address = results[0];
    let vicinity = address.formatted_address;
    let res = vicinity.split(',').splice(0, 1);
    return {
      location: {
        lat: address.geometry.location.lat(),
        lng: address.geometry.location.lng()
      },
      vicinity: `${res.join()} ${this.getBarrio(results)}`
    }
  }


  getCityName(results) {
    console.log(results);
    let search = ['locality', 'administrative_area_level_2'];
    let object = results.find(el => {
      return el.types.some((el) => search.includes(el))
    });
    let city = '';
    if (object) {
      city = object.address_components[0].long_name;
    }
    this.city = city;
    return (city);
  }

  getBarrio(results) {
    let search = ['neighborhood', 'sublocality_level_1']
    let object = results.find(el => {
      return el.types.some((el) => search.includes(el))
    });
    let barrio = ''
    if (object) {
      barrio = object.address_components[0].long_name;
      if (barrio.toLowerCase().indexOf('barrio') === -1) {
        barrio = 'Barrio ' + barrio
      }
    }
    return barrio;
  }
}
