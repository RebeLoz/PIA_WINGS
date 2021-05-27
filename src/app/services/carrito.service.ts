import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { Producto, Pedido, Cliente, ProductoPedido } from '../models';
import { FirebaseauthService } from './firebaseauth.service';
import { FirestoreService } from './firestore.service';
import { AlertController, ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private pedido: Pedido;
  pedido$ = new Subject<Pedido>();
  path = 'carrito/';
  uid = '';
  cliente: Cliente;

  carritoSuscriber: Subscription;
  clienteSuscriber: Subscription;

  constructor(public firebaseauthService: FirebaseauthService,
              public firestoreService: FirestoreService,
              public router: Router,
              public alertController: AlertController,
              public toastController: ToastController,) {

    //   console.log('CarritoService inicio');
      this.initCarrito();
      this.firebaseauthService.stateAuth().subscribe( res => {
            // console.log(res);
            if (res !== null) {
                  this.uid = res.uid;
                  this.loadCLiente();
            }
      });
   }

   //sirve por si el cliente se salio de la sesion y no finalizo el pedido
  loadCarrito() {
      const path = 'Clientes/' + this.uid + '/' + 'carrito';
      if (this.carritoSuscriber) {
        this.carritoSuscriber.unsubscribe();
      }
      this.carritoSuscriber = this.firestoreService.getDoc<Pedido>(path, this.uid).subscribe( res => {
            //   console.log(res);
              if (res) {
                    this.pedido = res;
                    this.pedido$.next(this.pedido);
              } else {
                  this.initCarrito();
              }

      });
  }

   //se inicializa el carrito como vacio
  initCarrito() {
      this.pedido = {
          id: this.uid,
          cliente: this.cliente,
          productos: [],
          precioTotal: null,
          estado: 'enviado',
          fecha: new Date(),
          valoracion: null,
      };
      this.pedido$.next(this.pedido);
  }

   //checa los cambios del cliente 
  loadCLiente() {
      const path = 'Clientes';
      this.clienteSuscriber = this.firestoreService.getDoc<Cliente>(path, this.uid).subscribe( res => {
            this.cliente = res;
            // console.log('loadCLiente() ->', res);
            this.loadCarrito();
            this.clienteSuscriber.unsubscribe();
      });
  }

   //carga los cambios del carrito
  getCarrito(): Observable<Pedido> {
    setTimeout(() => {
        this.pedido$.next(this.pedido);
    }, 100);
    return this.pedido$.asObservable();
  }

  //agrega un producto mas al carrito
  //si no haz iniciado sesion te manda una alerta de que debes iniciar sesion para poder comprar
  //y te manda a la pagina del perfil
 async addProducto(producto: Producto) {
     console.log('addProducto ->', this.uid);
     if (this.uid.length) {
      const toast = await this.toastController.create({
        message: 'Agregado al carrito',
        duration: 2000
      });

      toast.present();
        const item = this.pedido.productos.find( productoPedido => {
            return (productoPedido.producto.id === producto.id)
        });
        if (item !== undefined) {
            item.cantidad ++;
        } else {
           const add: ProductoPedido = {
              cantidad: 1,
              producto,
           };
           this.pedido.productos.push(add);
        }
     } else {

          const alert = await this.alertController.create({
            cssClass: 'normal',
            header: 'ALERTA',
            message: 'Debes iniciar sesion o registrarte',
            buttons: ['OK']
          });
          await alert.present();

          const { role } = await alert.onDidDismiss();
          this.router.navigate(['/perfil']);
          return;
     }
     this.pedido$.next(this.pedido);
     console.log('en add pedido -> ', this.pedido);
     const path = 'Clientes/' + this.uid + '/' + this.path;
     this.firestoreService.createDoc(this.pedido, path, this.uid).then( () => {
          console.log('añdido con exito');
     });
  }

  //remueve en uno la cantidad de productos del platillo
  removeProducto(producto: Producto) {
        console.log('removeProducto ->', this.uid);
        if (this.uid.length) {
            let position = 0;
            const item = this.pedido.productos.find( (productoPedido, index) => {
                position = index;
                return (productoPedido.producto.id === producto.id)
            });
            if (item !== undefined) {
                item.cantidad --;
                if (item.cantidad === 0) {
                     this.pedido.productos.splice(position, 1);
                }
                console.log('en remove pedido -> ', this.pedido);
                const path = 'Clientes/' + this.uid + '/' + this.path;
                this.firestoreService.createDoc(this.pedido, path, this.uid).then( () => {
                    console.log('removido con exito');
                });
            }
        }
  }

  realizarPedido() {

  }

   //se limpia el carrito
  clearCarrito() {
      const path = 'Clientes/' + this.uid + '/' + 'carrito';
      this.firestoreService.deleteDoc(path, this.uid).then( () => {
          this.initCarrito();
      });
  }


}