import { CameraResultType, CameraSource, Plugins } from '@capacitor/core';
import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController } from '@ionic/angular';
import { Cliente } from 'src/app/models';
import { FirebaseauthService } from '../../services/firebaseauth.service';
import { FirestoreService } from '../../services/firestore.service';
import { FirestorageService } from '../../services/firestorage.service';
import { Subscription } from 'rxjs';
import { GooglemapsComponent } from '../../googlemaps/googlemaps.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SafeMethodCall } from '@angular/compiler';
const { Camera } = Plugins;

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})

export class PerfilComponent implements OnInit {

  cliente: Cliente = {
    uid: '',
    email: '',
    celular: '',
    foto: '',
    referencia: '',
    nombre: '',
    ubicacion: null,
  };

  newFile: any;

  uid = '';

  suscriberUserInfo: Subscription;

  ingresarEnable = false;

  photos: SafeResourceUrl[] = [] as SafeResourceUrl[];

  constructor(public menucontroler: MenuController,
              public firebaseauthService: FirebaseauthService,
              public firestoreService: FirestoreService,
              public firestorageService: FirestorageService,
              private modalController: ModalController,
              private sanitizer: DomSanitizer) {
                this.firebaseauthService.stateAuth().subscribe( res => {
                  console.log(res);
                  if (res !== null) {
                    this.uid = res.uid;
                    this.getUserInfo(this.uid);
                  } else {
                    this.initCliente();
                  }
                });
  }

  async ngOnInit() {
    const uid = await this.firebaseauthService.getUid();
    console.log(uid);
  }

  initCliente() {
    this.uid = '';
    this.cliente = {
      uid: '',
      email: '',
      celular: '',
      foto: '',
      referencia: '',
      nombre: '',
      ubicacion: null,
    };
    console.log(this.cliente);
    // este es para inicializar en blanco los campos del perfil 
  }

   // se vera el menu principal 
  openMenu() {
    console.log('open menu');
    this.menucontroler.toggle('principal');
  }

   // esta es para cargar la foto del cliente 
  async newImageUpload(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.newFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = ((image) => {
        this.cliente.foto = image.target.result as string;
      });
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  // esta funcion es para que el cliente se tome la foto 
  async takePicture(){
    const image=await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });
    this.cliente.foto = (image.dataUrl);
  }

  // sirve para que el cliente se registre con el email y su numero de celular 
  async registrarse() {
    const credenciales = {
      email: this.cliente.email,
      password: this.cliente.celular,
    };
    const res = await this.firebaseauthService.registrar(credenciales.email, credenciales.password).catch( err => {
      console.log( 'error -> ',  err);
    });
    const uid = await this.firebaseauthService.getUid();
    this.cliente.uid = uid;
    this.guardarUser();
  }

  async guardarUser() {
    const path = 'Clientes';
    const name = this.cliente.nombre;
    if (this.newFile !== undefined) {
      const res = await this.firestorageService.uploadImage(this.newFile, path, name);
      this.cliente.foto = res;
    }
    this.firestoreService.createDoc(this.cliente, path, this.cliente.uid).then( res => {
        console.log('Guardado con exito');
    }).catch( error => {
    });// aqui se guardara los datos del cliente
  }
   
  // esta funcion es para que el cliente cierre sesion 
  async salir() {
    this.firebaseauthService.logout();
    this.suscriberUserInfo.unsubscribe();
  }

  // es para recuperar los datos del usuario cuando inicie sesion
  getUserInfo(uid: string) {
    console.log('getUserInfo');
    const path = 'Clientes';
    this.suscriberUserInfo = this.firestoreService.getDoc<Cliente>(path, uid).subscribe( res => {
      if (res !== undefined) {
        this.cliente = res;
      }
    });
  }

  // se utiliza para que el usuario inicie sesion si ya esta registrado 
  ingresar() {
    const credenciales = {
      email: this.cliente.email,
      password: this.cliente.celular,
    };
    this.firebaseauthService.login(credenciales.email, credenciales.password).then( res => {
      console.log('ingreso con exito');
    });
   }

   // aqui el cliente usara google maps para su ubicacion
  async addDirection() {
    const ubicacion = this.cliente.ubicacion;
    let positionInput = {  
      lat: 0,
      lng: 0,
    };
    if (ubicacion !== null) {
        positionInput = ubicacion; 
    }
    const modalAdd  = await this.modalController.create({
      component: GooglemapsComponent,
      mode: 'ios',
      swipeToClose: true,
      componentProps: {position: positionInput}
    });
    await modalAdd.present();
    const {data} = await modalAdd.onWillDismiss();
    if (data) {
      console.log('data -> ', data);
      this.cliente.ubicacion = data.pos;
      console.log('this.cliente -> ', this.cliente);
    }
  }
}
