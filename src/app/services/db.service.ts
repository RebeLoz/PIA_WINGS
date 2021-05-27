
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Platillo } from './platillo';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})

export class DbService {
  private storage: SQLiteObject;
  platillosList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private platform: Platform, 
    private sqlite: SQLite, 
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter,
  ) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'positronx_db.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
          this.storage = db;
          this.getFakeData();
      });
    });
  }

  dbState() {
    return this.isDbReady.asObservable();
  }
 
  fetchPlatillos(): Observable<Platillo[]> {
    return this.platillosList.asObservable();
  }

    // Render fake data
    getFakeData() {
      this.httpClient.get(
        'assets/dump.sql', 
        {responseType: 'text'}
      ).subscribe(data => {
        this.sqlPorter.importSqlToDb(this.storage, data)
          .then(_ => {
            this.getPlatillos();
            this.isDbReady.next(true);
          })
          .catch(error => console.error(error));
      });
    }

  // Get list
  getPlatillos(){
    return this.storage.executeSql('SELECT * FROM sugerenciastable', []).then(res => {
      let items: Platillo[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) { 
          items.push({ 
            id: res.rows.item(i).id,
            usuario_nombre: res.rows.item(i).usuario_nombre,  
            platillo_nombre: res.rows.item(i).platillo_nombre
           });
        }
      }
      this.platillosList.next(items);
    });
  }

  // Add
  addPlatillo(usuario_nombre, platillo_nombre) {
    let data = [usuario_nombre, platillo_nombre];
    return this.storage.executeSql('INSERT INTO sugerenciastable (usuario_nombre, platillo_nombre) VALUES (?, ?)', data)
    .then(res => {
      this.getPlatillos();
    });
  }
 
  // Get single object
  getPlatillo(id): Promise<Platillo> {
    return this.storage.executeSql('SELECT * FROM sugerenciastable WHERE id = ?', [id]).then(res => { 
      return {
        id: res.rows.item(0).id,
        usuario_nombre: res.rows.item(0).usuario_nombre,  
        platillo_nombre: res.rows.item(0).platillo_nombre
      }
    });
  }

  // Update
  updatePlatillo(id, platillo: Platillo) {
    let data = [platillo.usuario_nombre, platillo.platillo_nombre];
    return this.storage.executeSql(`UPDATE sugerenciastable SET usuario_nombre = ?, platillo_nombre = ? WHERE id = ${id}`, data)
    .then(data => {
      this.getPlatillos();
    })
  }

  // Delete
  deletePlatillo(id) {
    return this.storage.executeSql('DELETE FROM sugerenciastable WHERE id = ?', [id])
    .then(_ => {
      this.getPlatillos();
    });
  }
}
