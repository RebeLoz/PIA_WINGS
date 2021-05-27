import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { FirestoreService } from '../../services/firestore.service';
import { Producto } from '../../models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit {

  private path = 'Productos/';

  productos: Producto[] = [];

  constructor(public menucontroler: MenuController,
              public firestoreService: FirestoreService) {
                this.loadProductos();
              }

  ngOnInit() {}

  //aqui solo se abrira el menu principal
  openMenu() {
    console.log('open menu');
    this.menucontroler.toggle('principal');
  }

  loadProductos() {
      this.firestoreService.getCollection<Producto>(this.path).subscribe( res => {
            // console.log(res);
            this.productos = res;
      });
       // solo se cargaran los productos que escogimos 
  }
}
