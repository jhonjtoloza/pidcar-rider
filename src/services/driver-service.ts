import {Injectable} from "@angular/core";
import {AngularFireDatabase} from "angularfire2/database";
import {GeoFire} from "geofire";
import {BehaviorSubject} from "rxjs";
import {TripService} from "./trip-service";
import {PlaceService} from "./place-service";

@Injectable()
export class DriverService {

  activeDrivers$: BehaviorSubject<any>;

  constructor(public db: AngularFireDatabase,
              private tripService: TripService,
              private placeService: PlaceService) {
    this.activeDrivers$ = new BehaviorSubject([]);
  }

  // get driver by id
  getDriver(id) {
    return this.db.object('drivers/' + id);
  }

  startTrack(vehiculo_id, lat, lng) {
    this.activeDrivers$ = new BehaviorSubject([]);
    let ref: any = this.db.list(`tracking/${vehiculo_id}`);
    const geofire = new GeoFire(ref.$ref);
    const geoQuery = geofire.query({
      center: [lat, lng],
      radius: 2
    });
    geoQuery.on('key_entered', (key, location, distance) => {
      this.db.object(`drivers/${key}`)
        .take(1).subscribe(driver => {
        this.makeDriverList(driver, distance, location, key)
          .then(value => {
            let arr = this.activeDrivers$.value;
            arr.push(value);
            this.activeDrivers$.next(arr);
          })
      })
    });
    geoQuery.on('key_exited', (key) => {
      let arr: any[] = this.activeDrivers$.value;
      let index = arr.findIndex((value) => {
        return value.uid === key;
      });
      if (index > -1) {
        arr.splice(index, 1);
      }
      this.activeDrivers$.next(arr);
    });
    geoQuery.on('key_moved', (key, location, distance) => {
      let arr: any[] = this.activeDrivers$.value;
      let index = arr.findIndex((value) => {
        return value.uid === key;
      });
      if (index > -1) {
        let obj: any = arr.splice(index, 1);
        obj[0].location = {
          lat: location[0],
          lng: location[1]
        };
        arr.push(...obj);
        this.activeDrivers$.next(arr);
      } else {
        this.db.object(`drivers/${key}`)
          .take(1).subscribe(driver => {
          let arr = this.activeDrivers$.value;
          this.makeDriverList(driver, distance, location, key).then(value => {
            arr.push(value);
          });
        })
      }
      this.activeDrivers$.next(arr);
    });
  }

  async makeDriverList(driver, distance, location, key) {
    let origin = this.tripService.getOrigin();
    let result: any = await this.placeService.getDirection(location[0], location[1], origin.location.lat, origin.location.lng)
      .toPromise();
    let duration = "";
    console.log(result);
    if (result.routes.length) {
      duration = result.routes[0].legs[0].duration.text;
    }
    return {
      uid: key,
      location: {
        lat: location[0],
        lng: location[1]
      },
      duration: duration,
      name: driver.name,
      photo: driver.photoURL,
      rating: driver.rating,
      vehiculo: {
        marca: driver.brand,
        placa: driver.plate
      },
      distance: distance,
      app_token: driver.app_token
    };
  }

  getActiveDrivers() {
    return this.activeDrivers$.asObservable();
  }

  getDriverPosition(uid, cat) {
    return this.db.object(`tracking/${cat}/${uid}`)
  }
}
