import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform, ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Noticias } from './noticias';
import { Usuario } from './usuario';
import { AutoUsuario } from './auto-usuario';

@Injectable({
  providedIn: 'root'
})
export class DbservicioService {
  // variable para manipular la conexion a la base de datos
  public database: SQLiteObject;
  //variable para la sentencia de creación de tabla



  rol: string = "CREATE TABLE IF NOT EXISTS rol(id_rol INTEGER PRIMARY KEY autoincrement, nombre_rol VARCHAR(50) NOT NULL);";
  usuario: string = "CREATE TABLE IF NOT EXISTS usuario(id_usuario INTEGER PRIMARY KEY autoincrement, rut INTEGER NOT NULL, nombre VARCHAR(50) NOT NULL, apellidos VARCHAR(80) NOT NULL, correo VARCHAR(100) NOT NULL, clave VARCHAR(30) NOT NULL, rol_id_rol INTEGER NOT NULL  );";
  auto: string = "CREATE TABLE IF NOT EXISTS auto (patente VARCHAR2(10) PRIMARY KEY NOT NULL,color VARCHAR2(20) NOT NULL,modelo VARCHAR2(100) NOT NULL,annio DATE NOT NULL,usuario_id_usuario INTEGER NOT NULL);";
  viaje: string = "CREATE TABLE IF NOT EXISTS viaje (id_viaje INTEGER PRIMARY KEY autoincrement NOT NULL,fecha_viaje DATE NOT NULL,hora_salida DATE NOT NULL,asientos_dispo INTEGER NOT NULL,monto INTEGER NOT NULL,direccion VARCHAR2(500) NOT NULL,auto_patente VARCHAR2(10) NOT NULL);";
  detalleViaje: string = "CREATE TABLE IF NOT EXISTS detalle_viaje (id_detalle INTEGER PRIMARY KEY NOT NULL,status VARCHAR2(50) NOT NULL,usuario_id_usuario INTEGER NOT NULL,viaje_id_viaje INTEGER NOT NULL);";
  comuna: string = "CREATE TABLE IF NOT EXISTS comuna (id_comuna INTEGER PRIMARY KEY NOT NULL,nombre_comuna VARCHAR2(50) NOT NULL);";
  viaje_comuna: string = "CREATE TABLE IF NOT EXISTS viaje_comuna (id INTEGER PRIMARY KEY NOT NULL,viaje_id_viaje INTEGER NOT NULL,comuna_id_comuna INTEGER NOT NULL);";


  insertRol: string = "INSERT or IGNORE INTO rol(id_rol,nombre_rol) VALUES (1,'conductor');";
  insertRol2: string = "INSERT or IGNORE INTO rol(id_rol,nombre_rol) VALUES (2,'Pasajero');";
  insertAuto: string = "INSERT or IGNORE INTO auto(patente,color,modelo,annio,usuario_id_usuario) VALUES ('1234AV','verde','galloper',11-01-1955,1);";
  insertUsu: string = "INSERT or IGNORE INTO usuario(id_usuario,rut,nombre,apellidos,correo,clave,rol_id_rol) VALUES (1,118436341,'fabian','gomez','fabi@gmail.com','12345',1);";



  

  tablaNoticia: string = "CREATE TABLE IF NOT EXISTS noticia(id_noticia INTEGER PRIMARY KEY autoincrement, titulo VARCHAR(40) NOT NULL, texto TEXT NOT NULL);";
  //variable para la sentencia de registros por defecto en la tabla
  registroNoticia: string = "INSERT or IGNORE INTO noticia(id_noticia,titulo,texto) VALUES (1,'Feriado Halloween','Este feriado sera mas largo que el anterior');";
  //observable para manipular todos los registros de la tabla noticia
  listaRol = new BehaviorSubject([]);
  listaUsu = new BehaviorSubject([]);
  listaAutoUsu = new BehaviorSubject([]);

  //observable para manipular si la BD esta lista  o no para su manipulación
  private isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private sqlite: SQLite, private platform: Platform, private toastController: ToastController) { 
    this.crearBD();
  }

  async presentToast(msj: string) {
    const toast = await this.toastController.create({
      message: msj,
      duration: 3000,
      icon: 'globe'
    });

    await toast.present();
  }

  dbState() {
    return this.isDBReady.asObservable();
  }

  fetchNoticias(): Observable<Usuario[]> {
    return this.listaUsu.asObservable();
  }

  fetchUsuario(): Observable<AutoUsuario[]> {
    return this.listaAutoUsu.asObservable();
  }

  crearBD() {
    //verificamos que la plataforma este lista
    this.platform.ready().then(() => {
      //creamos la BD
      this.sqlite.create({
        name: 'bdnoticias.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        //guardamos la conexion a la BD en la variable propia
        this.database = db;
        //llamar a la funcion para crear las tablas
        this.crearTablas();
        this.presentToast("Base de datos creada");
      }).catch(e => {
        //muestro el mensaje de error en caso de ocurrir alguno
        this.presentToast("Error BD:" + e);
      })
    })
  }


  

  async crearTablas() {
    try {
      //ejecuto mis tablas


      await this.database.executeSql(this.rol, []);
      //ejecuto mis registros
      await this.database.executeSql(this.usuario, []);
      
      await this.database.executeSql(this.auto, []);
      //ejecuto mis registros
      await this.database.executeSql(this.viaje, []);

      await this.database.executeSql(this.detalleViaje, []);
      //ejecuto mis registros
      await this.database.executeSql(this.comuna, []);

      await this.database.executeSql(this.viaje_comuna, []);
      //ejecuto mis registros

      await this.database.executeSql(this.insertRol, []);
      await this.database.executeSql(this.insertRol2, []);
      await this.database.executeSql(this.insertUsu, []);
      await this.database.executeSql(this.insertAuto, []);

      //cargar todos los registros de la tabla en el observable

      
      //actualizar el status de la BD
      this.isDBReady.next(true);
      this.presentToast("tablas creadas");

    } catch (e) {
      this.presentToast("Error Tablas eeeee: " + e);
    }

  }

  buscarRol() {
    //retorno la ejecución del select
    return this.database.executeSql('SELECT * FROM rol', []).then(res => {
      //creo mi lista de objetos de noticias vacio
      let items: Noticias[] = [];
      //si cuento mas de 0 filas en el resultSet entonces agrego los registros al items
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          items.push({
            id_rol: res.rows.item(i).id_rol,
            nombreRol: res.rows.item(i).nombre_rol,
          })
        }

      }
      //actualizamos el observable de las noticias
      this.listaRol.next(items);
    })
  }


  buscarUsuario() {
    //retorno la ejecución del select
    return this.database.executeSql('SELECT nombre, rol.nombre_rol FROM usuario JOIN rol ON usuario.rol_id_rol=rol.id_rol WHERE rol.id_rol = 1', []).then(res => {
      //creo mi lista de objetos de noticias vacio
      let items: Usuario[] = [];
      //si cuento mas de 0 filas en el resultSet entonces agrego los registros al items
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          items.push({
            nombreUsu: res.rows.item(i).nombre,
            rolUsu: res.rows.item(i).nombre_rol,
          })
        }

      }
      //actualizamos el observable de las noticias
      this.listaUsu.next(items);
    })
  }


  buscarAuto() {
    //retorno la ejecución del select
    return this.database.executeSql('SELECT * FROM auto', []).then(res => {
      //creo mi lista de objetos de noticias vacio
      let items: AutoUsuario[] = [];
      //si cuento mas de 0 filas en el resultSet entonces agrego los registros al items
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          items.push({
            nombreCon: res.rows.item(i).patente,
            colorA: res.rows.item(i).color,
            modeloA: res.rows.item(i).modelo,
            annio: res.rows.item(i).annio,
          })
        }

      }
      //actualizamos el observable de las noticias
      this.listaAutoUsu.next(items);
    })
  }

  insertarNoticias(titulo: string,texto: string){
    let data = [titulo,texto];
    return this.database.executeSql('INSERT INTO noticia(titulo,texto) VALUES (?,?)',data).then(res=>{
      this.presentToast("Noticia Creada ");
      this.buscarRol();
    });

  }

  insertarAuto(patente: string ,color: string ,modelo: string ,annio: Date ,id_usuario: number){
    let data = [patente,color,modelo,annio,id_usuario];
    return this.database.executeSql('INSERT INTO auto(patente,color,modelo,annio,usuario_id_usuario) VALUES (?,?,?,?,?)',data).then(res=>{
      this.presentToast("Auto Registrado ");
      this.buscarAuto();
      
      
    })
    
    .catch((e) => {
      this.presentToast("error al ingresar auto ");

    });

  }

  async insertarRol(){
    try {
      //ejecuto mis tablas





      this.presentToast("rols ingresados y Usuario");

    } catch (e) {
      this.presentToast("Error Tablas mamonnnnnnnnnnn: " + e);
    }

  }

  modificarNoticias(id,titulo,texto){
    let data = [titulo,texto,id];
    return this.database.executeSql('UPDATE noticia SET titulo = ?, texto = ? WHERE id_noticia = ?',data).then(data2=>{
      this.buscarRol();
    })
  }

  eliminarNoticias(id){

    return this.database.executeSql('DELETE FROM noticia WHERE id_noticia = ?',[id]).then(a=>{
      this.buscarRol();
    })

  }



}
