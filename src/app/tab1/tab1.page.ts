import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Route } from '../models/route';
import { Frecuency } from '../models/frequency';
import { Seat } from '../models/seat';
import { Trip } from '../models/trip';
import { AuthService } from '../login/services/auth.service';
import { SeatService } from '../services/seat.service';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { SeatSelectorPage } from '../seat-selector/seat-selector.page';
import { filter, firstValueFrom } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Transaccion } from '../models/transactions';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  firebaseSvc=inject(FirebaseService)
  authSrv=inject(AuthService)
  seatSrv = inject(SeatService)

  cooperatives:any[]=[]
  routes:Route[]=[]
  buses:any[]=[]
  frecuencies: Frecuency[]=[]
  trips: Trip[]=[]

  selectedCooperative:string="";
  selectedOrigin: string = "";
  selectedDestination: string="";
  selectedDate: Date | null = null;
  selectedHour: string="";
  selectedSeat: Seat[] = [];
  selectedSeatsNumber: string = "";
  selectedMethod: string="";
  selectedCooperativeId = "";
  MetodoPago="";

  CooperativeIdenti = "";
  frecuenciaIdentiti ="";

  cooperativesNames : string[]=[];
  cooperativesIDNames:Object[] = []
  origins  = new Set<string>();
  originsFiltered = new Set<string>()
  destinationsFiltered=new Set<string>()
  destinations= new Set<string>()
  stops :string[]=[];
  cooperativeSeats: string[]=[]
  cooperativeBuses:string[]=[]

  seatTypes:string[]=[]
  selectedNormalSeats:Seat[] = [];
  selectedVIPSeats:Seat[] = [];

  hours = new Set<string>
  hoursFiltered = new Set<string>
  seats : Seat[]=[]
  availableSeats : number[]=[]
  methods = ['Transferencia','Depósito','Paypal']
  days:String[][]= []
  tripsFiltered:string[]=[]
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  daysInMonth: (number | null)[] = [];
  enabledWeekdays: Set<number> = new Set([]);
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  weekDays: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  isCalendarOpen: boolean = false;
  busFreq:string = ""

  daysInMonthWithPlaceholders: (number | null)[] = [];
  mostrarBotonPayPal = false;

  //Detalles
  seatNormalCost  : number =0
  seatVIPCost : number =0
  busNumber : number = 0
  busIds:string[]=[]
  subtotalNormal:number=0
  subtotalVIP:number=0
  iva:number=0
  totalNormal:number=0
  totalVIP:number=0
  coopertivaID=""
  subtotal:number=0
  total :number=0;
  //Orden de pago

  userName: string | null = null;
  frecuencyID: string =""
  tripId:string =""

  selectedBusId = ""
  selectedTripId = ""
  dates :String []= []
  vipPrice=0
  normalPrice=0
  showSaveButton: boolean = true;


  ngOnInit(){
    this.obtainCooperatives()
    this.updateCalendar();
}

  currentList: number = 1;

  isInitialFormValid():boolean{
    return (
      this.selectedCooperative !=="" &&
      this.selectedOrigin !== "" &&
      this.selectedDestination !== "" &&
      this.selectedHour !== "" &&
      this.selectedDate !== null
    )
  }

  isDetailsFormValid():boolean{
    return (
      this.selectedSeat.length> 0 &&
      this.seatNormalCost+this.seatVIPCost !== 0 &&
      this.busNumber !== 0
    )
  }

  goNext() {
    if (this.isInitialFormValid()) {
    this.obtainBuses();

   }
    this.currentList = 2;
  }

  goBack() {
    this.currentList = 1;
  }

  goPayOrder(){
    if(this.isDetailsFormValid()){
      this.MetodoPago=this.selectedMethod;
    this.currentList = 3;
      if(this.MetodoPago=="Transferencia" || this.MetodoPago=="Paypal"){
        this.goPayOrderNow()
      }
    this.authSrv.getCurrentUserDisplayName().subscribe(displayName => {
      this.userName =  displayName?.toString().split('@')[0] || 'Invitado';
    });
    this.establishPayments()

    }

  }

  goBack2(){
    this.currentList=2
  }


  constructor(private modalController:ModalController, private toastController: ToastController, private firestore: AngularFirestore, private alertController: AlertController, private cdr:ChangeDetectorRef) {
  }


  openCalendar(){
    this.isCalendarOpen = true;

  }
  closeCalendar(){
    this.isCalendarOpen = false;
  }



  saveDate(event:any){
    this.selectedDate=event.detail.value
    this.closeCalendar()
  }

  onCooperativeChange(event: any){
      const selectedName = event.detail.value;
      const selectedCooperative = this.cooperatives.find(coop => coop.name === selectedName);

      if (selectedCooperative) {
        this.selectedCooperativeId = selectedCooperative.id;
        this.CooperativeIdenti = this.selectedCooperativeId;
        this.coopertivaID=this.selectedCooperativeId
        this.loadFrecuenciesAndTrips()
      } else {
        console.error("No se encontró la cooperativa seleccionada.");
        this.selectedCooperativeId = "";
      }

  }

  async obtainCooperatives(){
    this.firebaseSvc.getAllDocuments('cooperatives').subscribe(documents => {
      this.cooperatives = documents;
      this.cooperativesNames = this.cooperatives.map(coop => coop.name);
      this.loadFrecuenciesAndTrips()
    }, error => {
      console.error('Error al obtener cooperativas:', error);
    });
}

async obtainFrecuencies(): Promise<void> {
  this.frecuencies = [];
  const frecuencyPromises: Promise<void>[] = [];

  if (!this.selectedCooperative || this.selectedCooperative.trim() === '') {
    for (let i = 0; i < this.cooperatives.length; i++) {
      const promise = new Promise<void>((resolve) => {
        this.firebaseSvc.getSubcolection('cooperatives', this.cooperatives[i].id, 'frecuencies')
          .subscribe(frecuencias => {
            frecuencias.forEach(frecuencia => {
              const frecuencieModel: Frecuency = {
                timeStart: frecuencia.timeStart,
                timeEnd: frecuencia.timeEnd,
                time: frecuencia.time,
                stops: frecuencia.stops,
                id: frecuencia.id,
                origin: frecuencia.origin,
                destiny: frecuencia.destiny,
                price: frecuencia.price,
                priceVip: frecuencia.priceVip,
                isBlocked: frecuencia.isBlocked,
                document: frecuencia.document,
              };
              if (!frecuencia.isBlocked) {
                this.frecuencies.push(frecuencieModel);
              }
            });
            resolve();
          });
      });
      frecuencyPromises.push(promise);
    }
  } else {
    const cooperative = this.cooperatives.find(coop => coop.name === this.selectedCooperative);
    if (cooperative) {
      const promise = new Promise<void>((resolve) => {
        this.firebaseSvc.getSubcolection('cooperatives', this.selectedCooperativeId, 'frecuencies')
          .subscribe(frecuencias => {
            frecuencias.forEach(frecuencia => {
              const frecuencieModel: Frecuency = {
                timeStart: frecuencia.timeStart,
                timeEnd: frecuencia.timeEnd,
                time: frecuencia.time,
                stops: frecuencia.stops,
                id: frecuencia.id,
                origin: frecuencia.origin,
                destiny: frecuencia.destiny,
                price: frecuencia.price,
                priceVip: frecuencia.priceVip,
                isBlocked: frecuencia.isBlocked,
                document: frecuencia.document,
              };
              if (!frecuencia.isBlocked) {
                this.frecuencies.push(frecuencieModel);
              }
            });
            resolve();
          });
      });
      frecuencyPromises.push(promise);
    }
  }

  await Promise.all(frecuencyPromises);
}

async loadFrecuenciesAndTrips() {
  await this.obtainFrecuencies();
  await this.obtainTrips();
}



  async obtainTrips() {
    this.trips = [];
    this.origins.clear();
    this.destinations.clear();
    this.trips = [];
    this.origins.clear();
    this.originsFiltered.clear();
    this.destinations.clear();
    this.destinationsFiltered.clear()
    this.hoursFiltered.clear()

    const subscriptionPromises: Promise<void>[] = [];

    if (!this.selectedCooperative || this.selectedCooperative.trim() === '') {
      for (let i = 0; i < this.cooperatives.length; i++) {
        const cooperativeId = this.cooperatives[i].id;
        const promise = new Promise<void>((resolve) => {
          this.firebaseSvc.getSubcolection('cooperatives', cooperativeId, 'viajes')
            .subscribe(viajes => {
              viajes.forEach(viaje => {

                const viajeData: Trip = {
                  date:viaje.date,
                  id:viaje.id,
                  idbus:viaje.idbus,
                  idcobrador:viaje.idcobrador,
                  idconductor:viaje.idconductor,
                  idfrec:viaje.idfrec,
                  price:viaje.price,
                  priceVip:viaje.priceVip,
                  seats:viaje.seats,
                  seatsVip:viaje.seatsVip,
                  status:viaje.status,
                };

                for (let j = 0; j < this.frecuencies.length; j++) {

                  if (viaje.idfrec == this.frecuencies[j].id) {
                    this.trips.push(viajeData);
                    this.origins.add(this.frecuencies[j].origin);
                    this.originsFiltered.add(this.frecuencies[j].origin);
                    this.destinations.add(this.frecuencies[j].destiny);
                    this.destinationsFiltered.add(this.frecuencies[j].destiny);
                    this.hours.add(this.frecuencies[j].timeStart);
                    this.hoursFiltered.add(this.frecuencies[j].timeStart);
                  }
                }
              });
              resolve();
            });
        });
        subscriptionPromises.push(promise);
      }
    } else {
      const cooperative = this.cooperatives.find(coop => coop.name === this.selectedCooperative);
      if (cooperative) {
        const cooperativeId = cooperative.id;
        const promise = new Promise<void>((resolve) => {
          this.firebaseSvc.getSubcolection('cooperatives', cooperativeId, 'viajes')
            .subscribe(viajes => {
              viajes.forEach(viaje => {
                const viajeData: Trip = {
                  date:viaje.date,
                  id:viaje.id,
                  idbus:viaje.idbus,
                  idcobrador:viaje.idcobrador,
                  idconductor:viaje.idconductor,
                  idfrec:viaje.idfrec,
                  price:viaje.price,
                  priceVip:viaje.priceVip,
                  seats:viaje.seats,
                  seatsVip:viaje.seatsVip,
                  status:viaje.status,
                };

                for (let j = 0; j < this.frecuencies.length; j++) {
                  if (viaje.idfrec === this.frecuencies[j].id) {
                    this.trips.push(viajeData);
                    this.origins.add(this.frecuencies[j].origin);
                    this.originsFiltered.add(this.frecuencies[j].origin);
                    this.destinations.add(this.frecuencies[j].destiny);
                    this.destinationsFiltered.add(this.frecuencies[j].destiny);
                    this.hours.add(this.frecuencies[j].timeStart);
                    this.hoursFiltered.add(this.frecuencies[j].timeStart);
                  }
                }
              });
              resolve();
            });
        });
        subscriptionPromises.push(promise);
      }
    }

    await Promise.all(subscriptionPromises);

    if (this.trips.length === 0) {
      console.log("No se encontraron rutas");
      this.originsFiltered.clear();
      this.destinationsFiltered.clear();
      this.hoursFiltered.clear();
    }
  }
              obtainOrigins(){
                if(this.selectedDestination !==""){
                  for(let i=0 ; i <this.frecuencies.length;i++){
                    if(this.frecuencies[i].stops.length>0){
                      for(let j=0; j<this.frecuencies[i].stops.length;j++){
                        if(this.selectedDestination==this.frecuencies[i].destiny|| this.selectedDestination==this.frecuencies[i].stops[j].name){
                          this.originsFiltered.add(this.frecuencies[i].origin)
                          this.frecuenciaIdentiti=this.frecuencies[i].id
                        }
                      }
                    }
                  }
                } else{
                  this.originsFiltered.clear()
                }
                this.obtainHours()
                this.populateDates()
                }

              obtainDestinations(){
                if(this.selectedOrigin!==""){
                  for(let i=0 ; i <this.frecuencies.length;i++){
                    if(this.selectedOrigin==this.frecuencies[i].origin){
                      this.destinationsFiltered.add(this.frecuencies[i].destiny)
                      if(this.frecuencies[i].stops.length>0){
                        for(let j=0; j<this.frecuencies[i].stops.length;j++){
                          this.destinationsFiltered.add(this.frecuencies[i].stops[j].name)
                        }

                      }
                    }

                  }
                }
                else{
                  this.destinationsFiltered.clear()
                }
                this.obtainHours()
                this.populateDates()
              }

              obtainHours(){
                if(this.selectedOrigin!=="" && this.selectedDestination!==""){
                  this.hoursFiltered.clear()
                  for(let j=0; j< this.trips.length ; j++){
                    for(let i=0; i<this.frecuencies.length;i++){
                      if(this.frecuencies[i].stops.length>0 && this.frecuencies[i].destiny !== this.selectedDestination){
                        for(let p =0; p<this.frecuencies[i].stops.length; p++){
                          if(this.frecuencies[i].stops[p].name==this.selectedDestination&&this.selectedOrigin==this.frecuencies[i].origin){
                            if(this.trips[j].idfrec==this.frecuencies[i].id){
                              console.log("Entré hora 1")
                                this.hoursFiltered.add(this.frecuencies[i].timeStart)
                              }
                        }
                      }
                    }
                      else{
                        if(this.selectedOrigin==this.frecuencies[i].origin&&this.selectedDestination==this.frecuencies[i].destiny){
                          if(this.trips[j].idfrec==this.frecuencies[i].id){
                                console.log("Entré hora 2")
                              this.hoursFiltered.add(this.frecuencies[i].timeStart)
                          }
                        }
                      }
                    }
                  }
                this.populateDates()
              }else{
                this.hoursFiltered.clear()
              }
              console.log(this.hoursFiltered)
            }


              enableOrigins(){
                  for(let i=0; i<this.routes.length;i++){
                    this.originsFiltered = this.origins
                  }
                  this.selectedOrigin = ""
              }

              enableDestinations(){
                for(let i=0; i<this.routes.length;i++){
                  this.destinationsFiltered = this.destinations
                }
                this.selectedDestination = ""
              }

              updateCalendar() {
                console.log(this.enabledWeekdays)
                const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1).getDay();
                const daysInMonth = this.getDaysInMonth(this.currentYear, this.currentMonth);

                const placeholdersBefore = (firstDayOfMonth + 6) % 7;
                const totalDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                this.daysInMonthWithPlaceholders = [
                  ...Array(placeholdersBefore).fill(null),
                  ...totalDays,
                  ...Array((7 - (placeholdersBefore + daysInMonth) % 7) % 7).fill(null),
                ];
              }

              previousMonth() {
                if (this.currentMonth === 0) {
                  this.currentMonth = 11;
                  this.currentYear--;
                } else {
                  this.currentMonth--;
                }
                this.updateCalendar();
              }

              nextMonth() {
                if (this.currentMonth === 11) {
                  this.currentMonth = 0;
                  this.currentYear++;
                } else {
                  this.currentMonth++;
                }
                this.updateCalendar();
              }

              splitDaysInWeeks(days: (number | null)[]): (number | null)[][] {
                const weeks: (number | null)[][] = [];
                for (let i = 0; i < days.length; i += 7) {
                  weeks.push(days.slice(i, i + 7));
                }
                return weeks;
              }

              selectDate(day: number | null):void {
                if (day === null) {
                  return;
                }
                const selectedDate = new Date(this.currentYear, this.currentMonth, day);
                if (selectedDate.getMonth() !== this.currentMonth) {
                  this.currentMonth = selectedDate.getMonth();
                  this.currentYear = selectedDate.getFullYear();
                  this.updateCalendar();
                }
                this.selectedDate = selectedDate;
                this.closeCalendar();
              }
getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

isCurrentMonth(day: number | null): boolean {
  return day !== null;
}

  isEnabled(day: number | null): boolean {
  if (!day) return false;

  const dateStr = new Date(this.currentYear, this.currentMonth, day).toISOString().split('T')[0];

  return this.dates.includes(dateStr);
}

populateDates(): void {
  this.dates = [];
  for (let i = 0; i < this.frecuencies.length; i++) {
    if(this.frecuencies[i].stops.length<=0){
    if (
      this.selectedOrigin === this.frecuencies[i].origin &&
      this.selectedDestination === this.frecuencies[i].destiny &&
      this.selectedHour === this.frecuencies[i].timeStart
    ) {
      for (let j = 0; j < this.trips.length; j++) {
        if (this.frecuencies[i].id === this.trips[j].idfrec) {
          const formattedDate = new Date(this.trips[j].date).toISOString().split('T')[0];
          this.dates.push(formattedDate);
        }
      }
    }
  }else{
    for(let q=0; q < this.frecuencies[i].stops.length;q++){
      if (
        this.selectedOrigin === this.frecuencies[i].origin &&
        this.selectedDestination === this.frecuencies[i].stops[q].name || this.selectedDestination === this.frecuencies[i].destiny &&
        this.selectedHour === this.frecuencies[i].timeStart
      ) {
        for (let j = 0; j < this.trips.length; j++) {
          if (this.frecuencies[i].id === this.trips[j].idfrec) {
            const formattedDate = new Date(this.trips[j].date).toISOString().split('T')[0];
            this.dates.push(formattedDate);
          }
        }
    }
  }
}
}
}

async obtainBuses() {
  console.log(this.trips);

  for (let j = 0; j < this.frecuencies.length; j++) {
    for (let i = 0; i < this.trips.length; i++) {
        console.log(this.frecuencies[j].id === this.trips[i].idfrec)
        console.log(formatToISO(this.trips[i].date) === formatToISO(this.selectedDate))
        console.log(formatToISO(this.selectedDate))
        console.log(formatToISO(this.trips[i].date))
      if (this.frecuencies[j].id === this.trips[i].idfrec && formatToISO(this.trips[i].date) === formatToISO(this.selectedDate)) {
        this.selectedTripId = this.trips[i].id;
      }
    }
  }

  try {
    const buses = await firstValueFrom(this.firebaseSvc.getSubcolection(
      'cooperatives',
      this.selectedCooperativeId,
      'buses'
    ));


    if (buses && Array.isArray(buses)) {
      buses.forEach(bus => {
        for (let i = 0; i < this.trips.length; i++) {
          if (this.trips[i].id === this.selectedTripId) {

            this.selectedBusId = this.trips[i].idbus;
            if (bus.id === this.trips[i].idbus) {
              this.busNumber = bus.plate;
            }
          }
        }
      });
    } else {
      console.warn("No se encontraron buses o la respuesta es inválida");
    }
  } catch (error) {
    console.error("Error al obtener los buses:", error);
  }

  await this.obtainSeats();
}

obtainCost(){
  this.seatNormalCost=0
  this.seatVIPCost=0
  console.log(this.seats)

  for(let i=0; i<this.frecuencies.length;i++){
    for(let k=0; k< this.trips.length;k++){
    if(this.frecuencies[i].id===this.trips[k].idfrec){

      if(this.frecuencies[i].stops.length<0 || this.frecuencies[i].stops.length>0 && this.frecuencies[i].destiny ===this.selectedDestination){
        for(let  l= 0; l< this.selectedSeat.length;l++){
        if(this.selectedSeat[l].category == "Normal"){
          for(let j=0;j<this.trips.length;j++){
            if(this.trips[j].id===this.selectedTripId){
            this.seatNormalCost += parseInt(this.trips[j].price)
            this.normalPrice = parseInt(this.trips[j].price)
            this.vipPrice =parseInt(this.trips[j].priceVip)
          }
        }
      }else{
        for(let j=0;j<this.trips.length;j++){
          if(this.trips[j].id===this.selectedTripId){
            this.seatVIPCost+=parseInt(this.trips[j].priceVip)
            this.normalPrice = parseInt(this.trips[j].price)
            this.vipPrice =parseInt(this.trips[j].priceVip)
          }
        }      }
      }
    }else{
        for(let l=0; this.frecuencies[i].stops.length;l++){
          console.log(this.frecuencies[i].stops[l].name)
          console.log(this.selectedDestination)
          if(this.frecuencies[i].stops[l].name === this.selectedDestination){
            for(let  m= 0; m< this.selectedSeat.length;m++){
              if(this.selectedSeat[m].category == "Normal"){
                this.seatNormalCost+=parseInt(this.frecuencies[i].stops[l].price)
                this.normalPrice = parseInt(this.frecuencies[i].stops[l].price)
                this.vipPrice =parseInt(this.frecuencies[i].stops[l].priceVip)
              }else{
                this.seatVIPCost+=parseInt(this.frecuencies[i].stops[l].priceVip)
                this.vipPrice =parseInt(this.frecuencies[i].stops[l].priceVip)
                this.normalPrice = parseInt(this.frecuencies[i].stops[l].price)

              }
          }
          break;
        }

    }

      }
    }

  }
}
}

async showToastCost() {

  const toast = await this.toastController.create({
    message: `Costo VIP: $${this.vipPrice} \nCosto Normal: $${this.normalPrice}`,
    duration: 4000,
    position: 'bottom',
    color: 'dark',
  });
  toast.present();
}

  establishPayments(){
    this.subtotalNormal = this.seatNormalCost
    this.subtotalVIP = this.seatVIPCost
    this.subtotal = this.subtotalNormal + this.subtotalVIP
    this.iva = this.subtotal * 15 / 100
    this.totalNormal = this.subtotalNormal + this.iva
    this.totalVIP = this.subtotalVIP + this.iva
    this.total = this.subtotal+this.iva
  }

  async saveTicket(texto: String) {
    this.selectedNormalSeats = this.selectedSeat.filter(seat => seat.category=="Normal")
    this.selectedVIPSeats =  this.selectedSeat.filter(seat => seat.category=="VIP")
    try {

      for (let i = 0; i < this.selectedSeat.length; i++) {
        const ticketData = {
          tripId: this.selectedTripId,
          userId: this.userName,
          frecuencyId: this.frecuencyID,
          date: this.selectedDate,
          seatType: this.selectedSeat[i].category,
          seatNumber: `Asiento-${this.selectedSeat[i].number}`,
          total: this.selectedSeat[i].category =="Normal"?this.totalNormal/this.selectedNormalSeats.length:this.totalVIP/this.selectedVIPSeats.length,
          paymentMethod: this.selectedMethod,
          plate: this.busNumber,
          estado: texto,
        };

        await this.firebaseSvc.addSubcollectionDocument(
          'cooperatives',
          this.selectedCooperativeId,
          'boletos',
          ticketData
        );
      }

      for (let j = 0; j < this.selectedSeat.length; j++) {
        const seatNumber = this.selectedSeat[j].number;

        try {
          await this.firebaseSvc.updateSeatStatusByNumber(
            'cooperatives',
            this.selectedCooperativeId,
            'viajes',
            this.selectedTripId,
            seatNumber,
            'reservado'
          );

        } catch (error) {
          console.error(`Error al actualizar el asiento ${seatNumber}:`, error);
        }
      }

      alert('Boletos guardados con éxito');
      this.showSaveButton = false;
      this.resetForm();
    } catch (error) {
      console.error('Error al guardar boletos:', error);
    }
  }

  goBack3(){
    this.currentList=3
  }

goPayOrderNow() {
  if (this.isDetailsFormValid()) {
    this.currentList = 3;

    this.authSrv.getCurrentUserDisplayName().subscribe(displayName => {
      this.userName = displayName?.toString().split('@')[0] || 'Invitado';
    });

    this.establishPayments();
    this.mostrarBotonPayPal = true;

    setTimeout(() => {
      const container = document.getElementById('paypal-button-container');
      if (!container) {
        console.error('El contenedor #paypal-button-container no existe todavía en el DOM.');
        return;
      }

      if (!(window as any).paypal) {
        this.cargarScriptPayPal().then(() => {
          this.iniciarBotonPayPal();
        }).catch(async err => {
          console.error('Error al cargar el script de PayPal:', err);
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'No se pudo cargar el sistema de pagos de PayPal.',
            buttons: ['OK'],
          });
          await alert.present();
        });
      } else {
        this.iniciarBotonPayPal();
      }
    }, 0);
  }
}


  resetForm() {
    this.currentList = 1;
    this.selectedDate = null;
    this.selectedCooperative = '';
    this.selectedOrigin = '';
    this.selectedDestination = '';
    this.selectedHour = '';
    this.selectedSeat = [];
    this.selectedSeatsNumber = '';
    this.selectedMethod = '';
    this.seatNormalCost = 0;
    this.seatVIPCost = 0;
    this.busNumber = 0;
  }

  isModalOpen = false;

  async openSelection() {
    if (this.isModalOpen) return;

    this.isModalOpen = true;
    try {
      const seatsSorted = this.seats.sort((a, b) => a.number - b.number);

      const modal = await this.modalController.create({
        component: SeatSelectorPage,
        componentProps: { seats: seatsSorted },
      });

      modal.onDidDismiss().then((data) => {
        if (data.data && data.data.selectedSeats) {
          this.selectedSeat = data.data.selectedSeats;
          this.obtainCost();
        }
      });

      await modal.present();
    } finally {
      this.isModalOpen = false;
    }
  }


 async obtainSeats() {
  this.seats = [];
  this.selectedSeat = [];
  this.busIds = [];


  this.firebaseSvc.getDocumentBus(
    'cooperatives',
    this.selectedCooperativeId,
    'viajes',
    this.selectedTripId,
  ).subscribe(viaje => {
    if (viaje && viaje.seatMap) {
      this.seats = viaje.seatMap.map((asiento:Seat) => ({
        category: asiento.category,
        floor: asiento.floor || 1,
        number: asiento.number,
        position: {
          left: asiento.position.left || 0,
          top: asiento.position.top || 0,
        },
        status: asiento.status,
      }));

      console.log('Asientos disponibles:', this.seats);
    } else {
      console.warn("No se encontraron asientos en el documento del bus.");
    }
  }, error => {
    console.error("Error obteniendo el documento del bus:", error);
  });
}



iniciarBotonPayPal() {
  (window as any).paypal.Buttons({
    createOrder: (data: any, actions: any) => {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: String(this.total),
            },
          },
        ],
      });
    },
    onApprove: async (data: any, actions: any) => {
      const order = await actions.order.capture();

      try {
        const cooperativaRef = this.firestore.collection('cooperatives').doc(this.selectedCooperativeId);
        const docSnapshot = await cooperativaRef.get().toPromise();

        if (docSnapshot && docSnapshot.exists) {
          const cooperativa = docSnapshot.data() as { price: string, name: string, uid: string };

          if (cooperativa) {
            const transactionData: Transaccion = {
              fecha: new Date(),
              precio: String(this.total),
              rutaId: this.tripId,
              userId: String(this.userName),
              cooperativaName: cooperativa.name,
            };

            try {
              await cooperativaRef.collection('Transacciones').add(transactionData);
              this.saveTicket('Pagado');
            } catch (transactionError) {
              console.error('Error al registrar la transacción:', transactionError);
              const alert = await this.alertController.create({
                header: 'Error',
                message: 'Hubo un error al registrar la transacción. Verifica los detalles.',
                buttons: ['OK'],
              });
              await alert.present();
            }
          }
        } else {
          console.error('La cooperativa no fue encontrada en Firestore');
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'No se pudo encontrar la cooperativa.',
            buttons: ['OK'],
          });
          await alert.present();
        }
      } catch (error) {
        console.error('Error al obtener la cooperativa:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Hubo un error al obtener la cooperativa.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    },
    onError: (err: any) => {
      console.error('Error en el pago de PayPal:', err);
      alert('Hubo un error en el proceso de pago');
    },
  }).render('#paypal-button-container');
}
cargarScriptPayPal(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).paypal) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=AQlaJUf_I2iYP7v1-EMbZU4v7k7x9NRmuIb6WN1-ebjBhh5LkPWuixf1-7TdJXZTniYPexF9EciDD76M&currency=USD';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Error al cargar el script de PayPal'));
    document.body.appendChild(script);
  });
}

}
 const formatToISO = (date: Date | string | null): string => {
    if (date === null) {
      return '';
    }
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj.toISOString().split('T')[0];
  };
