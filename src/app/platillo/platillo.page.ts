import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";
import { DbService } from './../services/db.service'
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-platillo',
  templateUrl: './platillo.page.html',
  styleUrls: ['./platillo.page.scss'],
})
export class PlatilloPage implements OnInit {
  editForm: FormGroup;
  id: any;

  constructor(
    private db: DbService,
    private router: Router,
    public formBuilder: FormBuilder,
    private actRoute: ActivatedRoute
  ) {
    this.id = this.actRoute.snapshot.paramMap.get('id');

    this.db.getPlatillo(this.id).then(res => {
      this.editForm.setValue({
        usuario_nombre: res['usuario_nombre'],
        platillo_nombre: res['platillo_nombre']
      })
    })
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      usuario_nombre: [''],
      platillo_nombre: ['']
    })
  }

  saveForm(){
    this.db.updatePlatillo(this.id, this.editForm.value)
    .then( (res) => {
      console.log(res)
      this.router.navigate(['/sugerencias']);
    })
  }

}