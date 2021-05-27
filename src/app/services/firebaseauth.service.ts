import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FirestoreService } from './firestore.service';
import { Cliente } from '../models';

@Injectable({
  providedIn: 'root'
})

export class FirebaseauthService {
  datosCliente: Cliente;
  constructor(public auth: AngularFireAuth,
              private firestoreService: FirestoreService) {
                this.stateUser();
              }

  stateUser() {
    this.stateAuth().subscribe( res => {
      // console.log(res);
      if (res !== null) {
        this.getInfoUser();
      }  
   });
  }

   //sirve para iniciar sesion si ya esta registrado
  login(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  //sirve para cerrar la sesion
  logout() {
    return this.auth.signOut();
  }

  //se utiliza para registrar a un nuevo usuario
  registrar(email: string, password: string) {
     return this.auth.createUserWithEmailAndPassword(email, password);
  }

   //se utiliza para asignar una id al cliente
  async getUid() {
    const user = await this.auth.currentUser;
    if (user === null) {
      return null;
    } else {
      return user.uid;
    }
  }

  stateAuth() {
    return this.auth.authState;
  }

   //se usa para obtener la informacion del cliente
  async getInfoUser() {
    const uid = await this.getUid();
    const path = 'Clientes';  
    this.firestoreService.getDoc<Cliente>(path, uid).subscribe( res => {
      if (res !== undefined) {
        this.datosCliente = res;
      }
    });
  }
}
