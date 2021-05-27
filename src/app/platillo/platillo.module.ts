import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlatilloPageRoutingModule } from './platillo-routing.module';

import { PlatilloPage } from './platillo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlatilloPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [PlatilloPage]
})
export class PlatilloPageModule {}
