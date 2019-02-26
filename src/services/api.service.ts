import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from "./auth-service";

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiService {

  environment = {
    apiUrl: 'http://192.168.1.11/puntosgold/web/',
    apiUrlhost: 'http://puntosdorados.com/'
  };

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  get(endPoint, login = false) {
    let headers = new HttpHeaders();
    if (login) {
      headers = new HttpHeaders({
        'Authorization': `Bearer ${this.auth.getToken()}`,
      });
    }
    return this.http.get(`${this.environment.apiUrlhost}${endPoint}`, {headers: headers})
      .toPromise();
  }

  post(endPoint, body, login = false) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    if (login) {
      headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${this.auth.getToken()}`
      });
    }
    return this.http.post(`${this.environment.apiUrlhost}${endPoint}`, this.jsonToURLEncoded(body), {headers: headers})
      .toPromise();
  }

  jsonToURLEncoded(jsonString) {
    return Object.keys(jsonString).map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(jsonString[key]);
    }).join('&');
  }
}
