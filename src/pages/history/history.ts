import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {TripService} from "../../services/trip-service";

@IonicPage()
@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage {
  trips: any[] = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public loadingCtrl: LoadingController,
              public tripService: TripService,
              public nav: NavController) {
  }

  ionViewDidLoad() {
    this.getTrips();
  }


  getTrips() {
    let loading = this.loadingCtrl.create({content: 'Cargando ...'});
    loading.present();
    this.tripService.getTrips().take(1).subscribe(snapshot => {
      this.trips = snapshot.reverse();
      loading.dismiss();
    });
  }

}
