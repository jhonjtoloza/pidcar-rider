import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "angularfire2/database/database";
import { Place } from "./place";
import { AuthService } from "./auth-service";
import { TRIP_STATUS_CANCELED } from "./constants";

@Injectable()
export class TripService {
  private id: any;
  private trips: any;
  private currency: string;
  private origin: any;
  private destination: any;
  private distance: number;
  private note: string;
  private vehicle: any;
  private promocode: any = '';
  private discount: any = 0;
  // vehicle's icon
  private icon: any;
  private availableDrivers: any[] = [];

  constructor(public db: AngularFireDatabase, public authService: AuthService) {

  }

  getAll() {
    return this.trips;
  }

  setId(id) {
    return this.id = id;
  }

  getId() {
    return this.id;
  }

  setCurrency(currency) {
    return this.currency = currency;
  }

  getCurrency() {
    return this.currency;
  }

  setOrigin(vicinity, lat, lng) {
    let place = new Place(vicinity, lat, lng);
    return this.origin = place.getFormatted();
  }

  getOrigin() {
    return this.origin;
  }

  setDestination(vicinity, lat, lng) {
    let place = new Place(vicinity, lat, lng);
    return this.destination = place.getFormatted();
  }

  getDestination() {
    return this.destination
  }

  setDistance(distance) {
    return this.distance = distance;
  }

  getDistance() {
    return this.distance;
  }

  setNote(note) {
    return this.note = note;
  }

  getNote() {
    return this.note;
  }

  setPromo(promocode) {
    return this.promocode = promocode;
  }

  getPromo() {
    return this.promocode;
  }

  setDiscount(discount) {
    return this.discount = discount;
  }

  getDiscount() {
    return this.discount;
  }

  setVehicle(vehicle) {
    return this.vehicle = vehicle;
  }

  setIcon(icon) {
    return this.icon = icon;
  }

  getIcon() {
    return this.icon;
  }

  setAvailableDrivers(vehicles: any[]) {
    console.log("set vehicles", vehicles.length);
    this.availableDrivers = vehicles;
  }

  getAvailableDrivers(): any[] {
    return this.availableDrivers;
  }

  getTrip(id) {
    return this.db.object('trips/' + id);
  }

  getTrips() {
    let user = this.authService.getUserData();
    return this.db.list('trips', {
      query: {
        orderByChild: 'passengerId',
        equalTo: user.uid
      }
    });
  }

  cancelTrip(id) {
    return this.db.object('trips/' + id).update({status: TRIP_STATUS_CANCELED})
  }

  rateTrip(tripId, stars) {
    return this.db.object('trips/' + tripId).update({
      rating: parseInt(stars)
    });
  }
}