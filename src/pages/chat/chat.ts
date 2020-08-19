import {Component, ViewChild} from '@angular/core';
import {Content, IonicPage, NavController, NavParams} from 'ionic-angular';
import {ApiService} from "../../services/api.service";
import {AuthService} from "../../services/auth-service";

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  @ViewChild('content') content: Content;

  soporte: any = {
    'chats': []
  };

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public nav: NavController,
              public api: ApiService,
              public user: AuthService) {
  }

  task: any;

  ionViewWillEnter() {
    console.log('enter view of Chat');
    this.checkSoporte();
    this.task = setInterval(() => {
      this.checkSoporte();
    }, 1000 * 60);
  }

  ionViewWillLeave() {
    console.log('leave view of chat');
    clearInterval(this.task);
  }

  ionViewDidLeave() {
    console.log('did leave view of chat');
    clearInterval(this.task);
  }

  ionViewWillUnload() {
    console.log('unload view of chat');
    clearInterval(this.task);
  }

  checkSoporte() {
    this.api.get('/api/app/chat?expand=chats.user', true)
      .then(response => {
        this.soporte = response;
      });
  }

  mensaje: string = '';

  sendMensaje() {
    console.log("call sendMensaje");
    console.log(this.mensaje);
    if (this.mensaje != '') {
      this.api.post('/api/app/send-chat?expand=chats.user',
        {mesaje: this.mensaje}, true).then(response => {
        this.soporte = response;
        this.mensaje = '';
      });
    }
  }
}
