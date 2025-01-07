import { Component, inject, OnInit } from '@angular/core';
import { QrService } from '../services/qr.service';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-escaner',
  templateUrl: './escaner.page.html',
  styleUrls: ['./escaner.page.scss'],
})
export class EscanerPage implements OnInit {

  JsonObject = false;
  JsonData:any
  userScanned = false;
  firebaseSvc=inject(FirebaseService)
  toast ={
    isOpen:false,
    message:'',
    color:'',
  };

  constructor(public qr:QrService, private frSrv:FirebaseService) { }

  async scan(){
    this.JsonObject = false
    this.JsonData=undefined
    await this.qr.startScan()

    try{
      let parseResult= JSON.parse(this.qr.scanResult)
      console.log(parseResult)
      if(parseResult.array){
        this.JsonObject=true
        this.JsonData = parseResult.array
      }

    }catch(e){
      console.log(e)
    }
    this.userScanned=true;
  }
  flashLight(){
    this.qr.flash()
  }

  async registerUser(){
    try{
      const message = await this.frSrv.validateAndRegisterTicket(this.qr.scanResult.ticketId)
      this.showToast(message,'success')
    }catch(error){
      console.error('Error al escanear el QR', error)
      this.showToast('El QR es inválido o el boleto ya fue usado.','danger')
    }
  }

  showToast(message:string, color:string){
    this.toast={
      isOpen:true,
      message,
      color,
    };
    setTimeout(() =>{
      this.toast.isOpen=false;
    },3000);
  }

  ngOnInit() {
  }
}
