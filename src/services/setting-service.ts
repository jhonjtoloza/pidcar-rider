import {Injectable} from "@angular/core";
import {AngularFireDatabase} from 'angularfire2/database';
import {ApiService} from "./api.service";

@Injectable()
export class SettingService {

  private driverCategories = [];

  constructor(public db: AngularFireDatabase, private api: ApiService) {
    this.driverCategories = JSON.parse(window.localStorage.getItem('driver_categories'))
    if (this.driverCategories == null)
      this.driverCategories = [];
  }

  getVehicleTypes() {
    return new Promise(resolve => {
      this.api.get('/apidriver/app/driver-categories')
        .then((value: any) => {
          resolve(value.categories);
          this.driverCategories = value.categories;
          window.localStorage.setItem('driver_categories', JSON.stringify(this.driverCategories));
        })
    });
  }

  getCategoryIcon(category_id) {
    for (let category of this.driverCategories) {
      if (category.id == category_id)
        return category.icon_map;
    }
  }

}
