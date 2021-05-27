import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlatilloPage } from './platillo.page';

const routes: Routes = [
  {
    path: '',
    component: PlatilloPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlatilloPageRoutingModule {}
