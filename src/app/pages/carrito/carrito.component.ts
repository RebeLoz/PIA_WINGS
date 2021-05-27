import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { FirestoreService } from '../../services/firestore.service';
import { Pedido } from '../../models';
import { CarritoService } from '../../services/carrito.service';
import { Subscription } from 'rxjs';
import { FirebaseauthService } from '../../services/firebaseauth.service';
import { retry } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
})

export class CarritoComponent implements OnInit, OnDestroy {
  pedido: Pedido;
  carritoSuscriber: Subscription;
  total: number;
  cantidad: number;

  constructor(public menucontroler: MenuController,
              public firestoreService: FirestoreService,
              public carritoService: CarritoService,
              public firebaseauthService: FirebaseauthService,
              public toastController: ToastController) {
                this.initCarrito();
                this.loadPedido();
              }

  ngOnInit() {}

  ngOnDestroy() {
    console.log('ngOnDestroy() - carrito componente');
    if (this.carritoSuscriber) {
      this.carritoSuscriber.unsubscribe();
    }
  }

  //nos aparece para abrir el menu 
  openMenu() {
    console.log('open menu');
    this.menucontroler.toggle('principal');
  }

  loadPedido() {
    this.carritoSuscriber = this.carritoService.getCarrito().subscribe( res => {
      console.log('loadPedido() en carrito', res);
      this.pedido = res;
      this.getTotal();
      this.getCantidad()  // aqui podemos cargar el pedido 
    });
    
  }

  initCarrito() {
    this.pedido = {
      id: '',
      cliente: null,
      productos: [],
      precioTotal: null,
      estado: 'enviado',
      fecha: new Date(),
      valoracion: null,
    };
    // se utiliza para inicializar un pedidos y se utliza para limpiar un pedido al agregar al carrito 
  }

  getTotal() {
    this.total = 0;
    this.pedido.productos.forEach( producto => {
      this.total = (producto.producto.precioReducido) * producto.cantidad + this.total; 
    });
    // el total del producto con un cierto descuento 
  }

  getCantidad() {
    this.cantidad = 0
    this.pedido.productos.forEach( producto => {
      this.cantidad =  producto.cantidad + this.cantidad; 
    });
    // cantidad de productos que se escogio 
  }

  async pedir() {
    if (!this.pedido.productos.length) {
      console.log('añade items al carrito');
      return;
    }
    this.pedido.fecha = new Date();
    this.pedido.precioTotal = this.total;
    this.pedido.id = this.firestoreService.getId();
    const uid = await this.firebaseauthService.getUid()
    const path = 'Clientes/' + uid + '/pedidos/' 
    console.log(' pedir() -> ', this.pedido, uid, path);
 // se utiliza para añadir un pedido a la firebase
    this.firestoreService.createDoc(this.pedido, path, this.pedido.id).then( () => {
      console.log('guadado con exito');
      this.carritoService.clearCarrito();
    });
// este solo hace que se haya guardado con exito (mensaje) 
    const toast = await this.toastController.create({
      message: 'Pedido Completado',
      duration: 2000
    });
    toast.present();
    // aqui sale el mensaje que fue pedido exitosamente 
  }
}
