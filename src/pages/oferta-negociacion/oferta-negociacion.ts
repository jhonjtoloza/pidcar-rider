import {Component} from '@angular/core';
import {IonicPage, ViewController} from 'ionic-angular';
import {Observable, Subscription} from "rxjs";
import {DealService} from "../../services/deal-service";
import {DEAL_STATUS_ACCEPTED} from "../../services/constants";

@IonicPage()
@Component({
  selector: 'page-oferta-negociacion',
  templateUrl: 'oferta-negociacion.html',
})
export class OfertaNegociacionPage {

  subscription: Subscription;
  deal: any;
  dealObject: any;
  drivers = [];

  constructor(private dealService: DealService, private modalCtrl: ViewController) {
    this.deal = this.dealService.getCurrentDeal();
    this.subscription = this.dealService.getCurrentDeal().subscribe(value => {
      this.dealObject = value;
      this.drivers = [];
      if (value.driversList) {
        Object.keys(value.driversList).forEach(key => {
          this.drivers.push(value.driversList[key]);
        });
      } else {
        this.cancelar();
      }
    });
  }

  cancelar() {
    this.subscription.unsubscribe();
    this.dealService.getCurrentDeal().remove();
    this.modalCtrl.dismiss(false);
  }

  accept(driver) {
    console.log(driver.oferta);
    this.dealObject.drivers[driver.uid] = true;
    this.dealObject.driverId = driver.uid;
    this.dealObject.status = DEAL_STATUS_ACCEPTED;
    this.dealObject.oferta_aceptada = driver.oferta;
    this.deal.update(this.dealObject);
    this.modalCtrl.dismiss(true);
  }

  async declinar(driver) {
    let uid = driver.uid;
    delete this.dealObject.drivers[uid];
    await this.deal.update(this.dealObject);
    this.deal.$ref.child(`driversList/${uid}`).remove();
  }
}
