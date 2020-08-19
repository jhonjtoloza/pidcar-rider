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
    console.log("cargando taximetro");
    this.api.post('/apidriver/app/taximetro', {city})
      .then((response: any) => {
        if (response !== false) {
          this.taximetro = response;
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
      // time = time / 4;
      // let precioDistancia = ((time / this.taximetro.segundos) * this.taximetro.distancia_precio);
      // if (this.taximetro.con_unidades){
      //   precioDistancia = precioDistancia * this.taximetro.precio_unidad;
      // }
      // this.price += precioDistancia;
    }
    this.price = Math.round(this.price)
    return this.price;
  }

  getMinValor() {
    return this.taximetro.con_unidades ? this.taximetro.minima * this.taximetro.precio_unidad : this.taximetro.minima;
  }
}
