import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FirebaseauthService } from './services/firebaseauth.service';
import { Subscription } from 'rxjs';
import { Plugins, StatusBarStyle } from '@capacitor/core';
import { Router } from '@angular/router';
const { SplashScreen, StatusBar } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent {
  admin = false;

  suscriberUserInfo: Subscription;
  constructor(
    private platform: Platform,
    private router: Router,
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar,
    private firebaseauthService: FirebaseauthService) {
    this.initializeApp();
    
  }

  initializeApp() {
    this.platform.ready().then(() => {
      SplashScreen.hide();
      StatusBar.setBackgroundColor({color: '#ffffff'});
      StatusBar.setStyle({
        style: StatusBarStyle.Light
      });

      // this.statusBar.styleDefault();
      // this.splashScreen.hide();
      this.getUid();
    });
  }

  getUid() {
    this.firebaseauthService.stateAuth().subscribe( res => {
      if (res !== null) {
        if (res.uid === 'aGbcYC0X9xfi9i6bEMNMJitwTK03')  {
          this.admin = true;
        } else {
          this.admin = false;
        }
      } else {
        this.admin = false;
      }
    });
  }

  onLogout(){
    this.firebaseauthService.logout();
    this.suscriberUserInfo.unsubscribe();
  }
}