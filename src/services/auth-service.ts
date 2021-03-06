import {Injectable} from "@angular/core";
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/take'
import {DEFAULT_AVATAR, EMAIL_VERIFICATION_ENABLED} from "./constants";

@Injectable()
export class AuthService {
  user: any;
  pdUSer: any;

  constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase) {
    this.pdUSer = JSON.parse(window.localStorage.getItem('pdUser'));
  }

  // get current user data from firebase
  getUserData() {
    return this.afAuth.auth.currentUser;
  }

  // get passenger by id
  getUser(id) {
    return this.db.object('passengers/' + id);
  }

  // login by email and password
  login(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }


  logout() {
    return this.afAuth.auth.signOut();
  }

  // register new account
  register(email, password, name, phoneNumber) {
    return Observable.create(observer => {
      this.afAuth.auth.createUserWithEmailAndPassword(email.trim(), password.trim())
        .then((authData: any) => {
        authData.name = name;
        authData.phoneNumber = phoneNumber;
        authData.isPhoneVerified = false;
        if (EMAIL_VERIFICATION_ENABLED === true)
          this.getUserData().sendEmailVerification();
        // update passenger object
        this.updateUserProfile(authData);
        observer.next(authData);
      }).catch((error: any) => {
        if (error) {
          observer.error(error);
        }
      });
    });
  }

  // update user display name and photo
  updateUserProfile(user) {
    console.log(user);
    let name = user.name ? user.name : user.email;
    let photoUrl = user.photoURL ? user.photoURL : DEFAULT_AVATAR;

    this.getUserData().updateProfile({
      displayName: name,
      photoURL: photoUrl
    });

    // create or update passenger
    this.db.object('passengers/' + user.uid).update({
      name: name,
      photoURL: photoUrl,
      email: user.email,
      phoneNumber: user.phoneNumber ? user.phoneNumber : '',
      isPhoneVerified: user.isPhoneVerified ? user.isPhoneVerified : false
    })
  }

  // create new user if not exist
  createUserIfNotExist(user) {
    // check if user does not exist
    this.getUser(user.uid).take(1).subscribe((snapshot: any) => {
      if (snapshot.$value === null) {
        // update passenger object
        this.updateUserProfile(user);
      }
    });
  }

  // update card setting
  updateCardSetting(number, exp, cvv, token) {
    const user = this.getUserData();
    this.db.object('passengers/' + user.uid + '/card').update({
      number: number,
      exp: exp,
      cvv: cvv,
      token: token
    })
  }

  // get card setting
  getCardSetting() {
    const user = this.getUserData();
    return this.db.object('passengers/' + user.uid + '/card');
  }

  getToken() {
    console.log(this.pdUSer);
    return this.pdUSer.access_token;
  }

  setPDUser(value: Object) {
    this.pdUSer = value;
    window.localStorage.setItem('pdUser', JSON.stringify(this.pdUSer));
  }

  delete() {
    let user = this.afAuth.auth.currentUser;
    user.delete().then().catch()
  }

  setPushToken(token) {
    let user = this.getUserData();
    this.getUser(user.uid).update({
      push_token: token
    })
  }

  getAccessParam() {
    return this.pdUSer.access_token;
  }
}
