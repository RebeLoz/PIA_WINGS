import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";
import { ToastController } from '@ionic/angular';
import { Router } from "@angular/router";
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-sugerencias',
  templateUrl: './sugerencias.component.html',
  styleUrls: ['./sugerencias.component.scss'],
})
export class SugerenciasComponent implements OnInit {

  constructor(
    private db: DbService,
    public formBuilder: FormBuilder,
    private toast: ToastController,
    private router: Router
  ) { }

    mainForm: FormGroup;
    Data: any[] = []

ngOnInit() {
  this.db.dbState().subscribe((res) => {
    if(res){
      this.db.fetchPlatillos().subscribe(item => {
        this.Data = item
      })
    }
  });

  this.mainForm = this.formBuilder.group({
    usuario: [''],
    platillo: ['']
  })
}

storeData() {
  this.db.addPlatillo(
    this.mainForm.value.usuario,
    this.mainForm.value.platillo
  ).then((res) => {
    this.mainForm.reset();
  })
}

deletePlatillo(id){
  this.db.deletePlatillo(id).then(async(res) => {
    let toast = await this.toast.create({
      message: 'Platillo eliminado',
      duration: 2500
    });
    toast.present();      
  })
}

}
