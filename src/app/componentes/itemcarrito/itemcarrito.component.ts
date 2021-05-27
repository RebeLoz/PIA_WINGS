import { Component, Input, OnInit } from '@angular/core';
import { ProductoPedido } from '../../models';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-itemcarrito',
  templateUrl: './itemcarrito.component.html',
  styleUrls: ['./itemcarrito.component.scss'],
})

export class ItemcarritoComponent implements OnInit {

  @Input() productoPedido: ProductoPedido;
  @Input() botones = true;

  constructor(public carritoService: CarritoService) { }

  ngOnInit() {}

   //se utiliza para agregar un producto al platillo
  addCarrito() {
    console.log('addCarrito()');
    this.carritoService.addProducto(this.productoPedido.producto);
  }

  //se utiliza para eliminar un producto al platillo
  removeCarrito() {
      this.carritoService.removeProducto(this.productoPedido.producto);
  }

}
