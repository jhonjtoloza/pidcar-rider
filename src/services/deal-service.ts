import {Injectable} from "@angular/core";
import {AngularFireDatabase} from "angularfire2/database/database";
import {DEAL_STATUS_PENDING} from "./constants";
import {AuthService} from "./auth-service";
import {DriverService} from "./driver-service";
import {TripService} from "./trip-service";

@Injectable()
export class DealService {

  constructor(
    public db: AngularFireDatabase,
    public authService: AuthService,
    private driver: DriverService,
    private tripService: TripService) {
  }

  // make deal to driver
  makeDeal(serivice_id, origin, destination, note, passenger, oferta, typeViaje, priceTaximetro) {
    let user = this.authService.getUserData();
    let drivers: any[] = this.driver.activeDrivers$.value;

    const driversValues = {};
    const driversList = {};
    drivers.forEach(value => {
      driversValues[value.uid] = true;
    });
    drivers.forEach(driver => {
      driversList[driver.uid] = Object.assign({
        changed: false,
        accepted: false,
        oferta: oferta
      }, driver)
    })
    return this.db.object(`deals/${user.uid}`).set({
      passenger: passenger,
      passengerId: user.uid,
      origin: origin,
      destination: destination,
      distance: this.tripService.getDistance(),
      duration: this.tripService.getDuration(),
      note: note,
      status: DEAL_STATUS_PENDING,
      createdAt: Date.now(),
      updated: Date.now(),
      drivers: driversValues,
      driversList: driversList,
      type_trip: typeViaje,
      oferta: oferta,
      taximetro_price: priceTaximetro
    });
  }

  getCurrentDeal() {
    let user = this.authService.getUserData();
    return this.db.object(`deals/${user.uid}`);
  }
}
