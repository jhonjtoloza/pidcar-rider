import {Injectable} from "@angular/core";
import {AngularFireDatabase} from "angularfire2/database/database";
import {Place} from "../model/place";
import {AuthService} from "./auth-service";
import {TRIP_STATUS_CANCELED} from "./constants";

@Injectable()
export class TripService {

  private id: any;
  private trips: any;
  private origin: any;
  private destination: any;
  private distance: { tex: string, value: number };
  private duration: { tex: string, value: number };
  private note: string;
  private vehicle: any;
  private typeViaje: "Taximetro"; // Taximetro | Oferta
  // vehicle's icon
  private icon: any;
  private oferta: any = 0;

  constructor(public db: AngularFireDatabase,
              public authService: AuthService) {

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

  getDistance(): { tex: string, value: number } {
    return this.distance;
  }

  getDuration(): { tex: string, value: number } {
    return this.duration
  }

  setNote(note) {
    return this.note = note;
  }

  getNote() {
    return this.note;
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

  getTrip(id) {
    return this.db.object('trips/' + id);
  }

  getTrips() {
    let user = this.authService.getUserData();
    return this.db.list('trips', {
      query: {
        orderByChild: 'passengerId',
        equalTo: user.uid,
      },
    });
  }

  cancelTrip(id) {
    return this.db.object('trips/' + id).update({status: TRIP_STATUS_CANCELED})
  }

  rateTrip(tripId, data) {
    return this.db.object('trips/' + tripId).update({
      rating: parseInt(data.rating),
      comment: data.comment
    });
  }

  cancel(tripId) {
    this.db.object('trips/' + tripId).update({
      droppedOffAt: Date.now(),
      status: TRIP_STATUS_CANCELED
    }).then().catch()
  }

  confirmPagoPuntos(tripId) {
    this.db.object(`trips/${tripId}`).update({
      solictud_pago_puntos: true
    }).then().catch()
  }

  setDuration(duration: any) {
    this.duration = duration;
  }

  setTypeViaje(typeViaje: any) {
    this.typeViaje = typeViaje;
  }

  getTypeViaje() {
    return this.typeViaje
  }

  setOferta(price) {
    this.oferta = price;
  }

  getOferta() {
    return this.oferta;
  }
}
