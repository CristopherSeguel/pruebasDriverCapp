import { Component } from '@angular/core';
import { DbservicioService } from "../services/dbservicio.service";
import { Noticias } from '../services/noticias';
import { ToastController } from '@ionic/angular';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {


  patente: string = "";
  color: string = "";
  modelo: string = "";
  start: Date;
  usuario: number;



  listaNoticias: any = [];

  

  arregloUsuarios: any = [
    {
      nombreUsu: '',
      rolUsu: ''
    }

  ]

  arregloRol: any = [
    {
      id_rol: '',
      nombreRol: ''
    }

  ]

  arregloAutoConductor: any = [
    {
      nombreCon: '',
      modeloA: '',
      colorA: '',
      annio: ''

    }

  ]
  


  constructor(public database: DbservicioService,private toastController: ToastController) {
    this.database.crearBD();
    
    
  }


  async presentToast(msj: string) {
    const toast = await this.toastController.create({
      message: msj,
      duration: 3000,
      icon: 'globe'
    });

    await toast.present();
  }

  addNoticia(start) {

    start = new Date(Date.now());


      // add category
      this.database.insertarAuto(this.patente,this.color,this.modelo,this.start,this.usuario)
      this.presentToast("usuario ingresado:" );
      
    }
  



  ngOnInit() {
    this.database.dbState().subscribe(res=>{
      if(res){
        this.database.fetchUsuario().subscribe(item=>{
          
          this.arregloAutoConductor = item;
          
        })
      }
    })
  }

}
