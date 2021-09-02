import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Taximetro} from '../model/taximetro';
import {TripService} from "./trip-service";

@Injectable()
export class TaximetroService {

  taximetro: Taximetro = null;
  price = 0;

  constructor(private api: ApiService,
              private tripService: TripService) {
  }

  loadTaximetro(city) {

    this.api.post('/apidriver/app/taximetro', {city})
      .then((response: any) => {
        if (response !== false) {
          this.taximetro = response;
          console.log("cargando taximetro");
        }
      });
  }

  calculatePrice() {
    if (this.taximetro != null) {
      let distance = this.tripService.getDistance();
      //let time = this.tripService.getDuration().value;
      this.price = ((distance.value / this.taximetro.distancia_mts)) * this.taximetro.distancia_precio;
      if (this.taximetro.con_unidades) {
        this.price = this.price * this.taximetro.precio_unidad;
        this.price += this.taximetro.arranque * this.taximetro.precio_unidad;
        let minima = this.taximetro.minima * this.taximetro.precio_unidad;
        if (this.price <= minima) {
          return minima
        }
      } else {
        this.price += this.taximetro.arranque;
        if (this.taximetro.minima > this.price) {
          return this.taximetro.minima
        }
      }
    }
    this.price = Math.round(this.price);
    this.price += this.getRecargoPaP()
    this.price += this.getRecargoDominicalFestivo();
    this.price += this.getRecargoNocturno();
    return this.price;
  }

  getMinValor() {
    return this.taximetro.con_unidades ? this.taximetro.minima * this.taximetro.precio_unidad : this.taximetro.minima;
  }

  getRecargoDominicalFestivo() {
    if (this.taximetro != null) {
      let day = new Date().getDay();
      if (day == 0 || this.taximetro.isFestivo)
        return (this.taximetro.con_unidades) ?
          this.taximetro.recargo_nocturno * this.taximetro.precio_unidad : this.taximetro.recargo_nocturno
    }
    return 0;
  }

  getRecargoPaP() {
    if (this.taximetro != null) {
      return (this.taximetro.con_unidades) ?
        this.taximetro.recargo_puerta_puerta * this.taximetro.precio_unidad : this.taximetro.recargo_puerta_puerta
    }
    return 0;
  }

  getRecargoNocturno() {
    if (this.taximetro != null) {
      let desdeHasta = this.getTimeServer()
      let hour = TaximetroService.getTime();
      if (hour > desdeHasta[0] || hour <= desdeHasta[1]) {
        return (this.taximetro.con_unidades) ?
          this.taximetro.recargo_nocturno * this.taximetro.precio_unidad : this.taximetro.recargo_nocturno
      }
    }
    return 0;
  }

  private static getTime() {
    let hour = new Date().getHours();
    let min = new Date().getMinutes();
    let h = (hour <= 9) ? `0${hour}` : hour;
    let m = (min <= 9) ? `0${min}` : min;
    return `${h}:${m}`
  }

  private getTimeServer() {
    let desde = this.taximetro.hora_inicio.split(':');
    desde.pop()
    let hasta = this.taximetro.hora_fin.split(':');
    hasta.pop()
    return [desde.join(':'), hasta.join(':')]
  }
}
