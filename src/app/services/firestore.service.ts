import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Camera, CameraPhoto, CameraResultType, CameraSource, Filesystem, FilesystemDirectory, Storage } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})

export class FirestoreService {
  public photos: Photo[] = [];
  private PHOTO_STORAGE: string = "photos";
  constructor(public database: AngularFirestore) { }

  //se utiliza para crear un documento nuevo en firebase
  createDoc(data: any, path: string, id: string) {
    const collection = this.database.collection(path);
    return collection.doc(id).set(data);
  }

  //se utiliza para leer la informacion del cliente
  getDoc<tipo>(path: string, id: string) {
    const collection = this.database.collection<tipo>(path);
    return collection.doc(id).valueChanges();
  }

  //se utiliza para borrar un documento en firebase
  deleteDoc(path: string, id: string) {
    const collection = this.database.collection(path);
    return collection.doc(id).delete();
  }

  //se utiliza para actualizar un documento en firebase
  updateDoc(data: any, path: string, id: string) {
    const collection = this.database.collection(path);
    return collection.doc(id).update(data);
  }

   //crea un id
  getId() {
    return this.database.createId();
  }

  //lee todos los documentos de una coleccion en firebase
  getCollection<tipo>(path: string) {
    const collection = this.database.collection<tipo>(path);
    return collection.valueChanges();
  }

  //consigue una coleccion mediante un parametro
  getCollectionQuery<tipo>(path: string, parametro: string, condicion: any, busqueda: string) {
    const collection = this.database.collection<tipo>(path, 
      ref => ref.where( parametro, condicion, busqueda));
    return collection.valueChanges();
  }

  //consigue toda una coleccion y la organiza en base a la fecha
  getCollectionAll<tipo>(path, parametro: string, condicion: any, busqueda: string, startAt: any) {
    if (startAt == null) {
      startAt = new Date();
    }
    const collection = this.database.collectionGroup<tipo>(path, 
      ref => ref.where( parametro, condicion, busqueda)
                .orderBy('fecha', 'desc')
                .limit(1)
                .startAfter(startAt)
      );
    return collection.valueChanges();
  }

  //sirve para una funcion llamada cargar mas, que lo que hace es 
  //mostrar solamente algunos datos y le picamos a un boton llamado cargar mas
  //y nos trae otra pagina con datos
  getCollectionPaginada<tipo>(path: string, limit: number, startAt: any) {
    if (startAt == null) {
      startAt = new Date();
    }
    const collection = this.database.collection<tipo>(path, 
      ref => ref.orderBy('fecha', 'desc')
                .limit(limit)
                .startAfter(startAt)
      );
    return collection.valueChanges();
  }

    //sirve para guardar una imagen
  public async loadSaved() {
    // Retrieve cached photo array data
    const photoList = await Storage.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(photoList.value) || [];

    // more to come...

    for (let photo of this.photos) {
      // Read each saved photo's data from the Filesystem
      const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data
      });

      // Web platform only: Load the photo as base64 data
      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
  }
}



  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // file-based data; provides best performance
      source: CameraSource.Camera, // automatically take a new photo with the camera
      quality: 100 // highest quality (0 to 100)
    });

    // Save the picture and add it to photo collection
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);
    console.log(capturedPhoto);
    console.log(savedImageFile);
  }

  private async savePicture(cameraPhoto: CameraPhoto) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto);

    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return {
      filepath: fileName,
      webviewPath: cameraPhoto.webPath
    };
  }





  private async readAsBase64(cameraPhoto: CameraPhoto) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }






  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}





export interface Photo {
  filepath: string;
  webviewPath: string;
}







