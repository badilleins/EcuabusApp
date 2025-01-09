import { Component, inject } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Route } from '../models/route';
import { Frecuency } from '../models/frequency';
import { Seat } from '../models/seat';
import { Trip } from '../models/trip';
import { AuthService } from '../login/services/auth.service';
import { SeatService } from '../services/seat.service';
import { ModalController, ToastController } from '@ionic/angular';
import { SeatSelectorPage } from '../seat-selector/seat-selector.page';
import { firstValueFrom } from 'rxjs';

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

  //Detalles
  seatCost  : number =0
  busNumber : number = 0
  busIds:string[]=[]
  subtotal:number=0
  iva:number=0
  total:number=0

  //Orden de pago

  userName: string | null = null;
  frecuencyID: string =""
  tripId:string =""

  selectedBusId = ""
  selectedTripId = ""
  dates :String []= []
  vipPrice=0
  normalPrice=0

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
      this.seatCost !== 0 &&
      this.selectedMethod !== "" &&
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
    this.currentList = 3;
    this.authSrv.getCurrentUserDisplayName().subscribe(displayName => {
      this.userName =  displayName?.toString().split('@')[0] || 'Invitado';
    });
    this.establishPayments()

    }

  }

  goBack2(){
    this.currentList=2
  }


  constructor(private modalController:ModalController, private toastController: ToastController) {
  }

  openCalendar(){
    console.log("open calendar")
    this.isCalendarOpen = true;

  }
  closeCalendar(){
    this.isCalendarOpen = false;
    console.log("close calendar")
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
        console.log("Cooperativa seleccionada:", selectedName, "ID:", this.selectedCooperativeId);
      } else {
        console.error("No se encontró la cooperativa seleccionada.");
        this.selectedCooperativeId = "";
      }

  }

  async obtainCooperatives(){
    this.firebaseSvc.getAllDocuments('cooperatives').subscribe(documents => {
      this.cooperatives = documents;
      console.log(this.cooperatives)
      this.cooperativesNames = this.cooperatives.map(coop => coop.name);
      console.log('Nombres de cooperativas:', this.cooperativesNames);
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
            console.log("una frecuencia")
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
                console.log("frecuencia no bloqueada")
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
        this.firebaseSvc.getSubcolection('cooperatives', cooperative.id, 'frecuencies')
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
    console.log(this.frecuencies)
    this.trips = [];
    this.origins.clear();
    this.destinations.clear();

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
                console.log(viajeData)

                for (let j = 0; j < this.frecuencies.length; j++) {
                  console.log(viaje.id)
                  console.log(this.frecuencies[j].id)
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
                  console.log("hay frecuencias")
                  if (viaje.idfrec === this.frecuencies[j].id) {
                    console.log("viaje igual frecuencia")
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
                  this.originsFiltered.clear()
                  for(let i=0 ; i <this.frecuencies.length;i++){
                    if(this.selectedDestination==this.frecuencies[i].destiny){
                      this.originsFiltered.add(this.frecuencies[i].origin)
                    }
                  }
                }
                this.populateDates()
                }

              obtainDestinations(){
                if(this.selectedOrigin!==""){
                  this.destinationsFiltered.clear()
                  for(let i=0 ; i <this.frecuencies.length;i++){
                    if(this.selectedOrigin==this.frecuencies[i].origin){
                      this.destinationsFiltered.add(this.frecuencies[i].destiny)
                    }
                  }
                }
                this.populateDates()
              }

              obtainHours(){
                  if(this.selectedOrigin!=="" && this.selectedDestination!==""){
                      this.hoursFiltered.clear()
                      for(let i=0; i<this.frecuencies.length;i++){
                          if(this.selectedOrigin==this.frecuencies[i].origin&&this.selectedDestination==this.frecuencies[i].destiny){
                            for(let j=0; j< this.trips.length ; j++){
                              if(this.trips[j].idfrec==this.frecuencies[i].id){
                                this.hoursFiltered.add(this.frecuencies[i].timeStart)
                              }
                            }

                          }
                      }
                  }
                  this.populateDates()
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
  if (!day) return false; // Si el día es nulo, no está habilitado.

  const dateStr = new Date(this.currentYear, this.currentMonth, day).toISOString().split('T')[0];

  // Comprueba si la fecha actual está en el arreglo de fechas habilitadas.
  return this.dates.includes(dateStr);
}

populateDates(): void {
  this.dates = [];
  for (let i = 0; i < this.frecuencies.length; i++) {
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
  }
}


async obtainBuses() {
  console.log("Hola dfe");
  console.log(this.trips);

  for (let j = 0; j < this.frecuencies.length; j++) {
    for (let i = 0; i < this.trips.length; i++) {
      if (this.frecuencies[j].id === this.trips[i].idfrec && formatToISO(this.trips[i].date) === formatToISO(this.selectedDate)) {
        this.selectedTripId = this.trips[i].id;
        console.log(this.selectedTripId);
      }
    }
  }

  console.log(this.selectedTripId);
  console.log("cooperativa" + this.selectedCooperativeId);

  try {
    // Usamos firstValueFrom para obtener la primera emisión del observable
    const buses = await firstValueFrom(this.firebaseSvc.getSubcolection(
      'cooperatives',
      this.selectedCooperativeId,
      'buses'
    ));

    console.log(buses);

    if (buses && Array.isArray(buses)) {
      console.log("Primera entrada");
      buses.forEach(bus => {
        for (let i = 0; i < this.trips.length; i++) {
          if (this.trips[i].id === this.selectedTripId) {
            console.log("entre al bus");

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

  console.log("numero bus" + this.busNumber);
  console.log("id bus" + this.selectedBusId);

  await this.obtainSeats();
}

  obtainCost(){
    this.seatCost= 0
    console.log(this.seats)

    for(let  i= 0; i< this.selectedSeat.length;i++){
      if(this.selectedSeat[i].category == "Normal"){
        for(let j=0;j<this.trips.length;j++){
          if(this.trips[j].id===this.selectedTripId){
            this.seatCost+=parseInt(this.trips[j].price)
            this.normalPrice = parseInt(this.trips[j].price)
          }
        }
      }else{
        for(let j=0;j<this.trips.length;j++){
          if(this.trips[j].id===this.selectedTripId){
            this.seatCost+=parseInt(this.trips[j].priceVip)
            this.vipPrice =parseInt(this.trips[j].priceVip)
          }
        }      }
  }
  }

  async showToastCost() {


        for(let j=0;j<this.trips.length;j++){
          if(this.trips[j].id===this.selectedTripId){
           this.vipPrice = parseInt(this.trips[j].priceVip)
           this.normalPrice = parseInt(this.trips[j].price)
          }
        }


    const toast = await this.toastController.create({
      message: `Costo VIP: $${this.vipPrice} \nCosto Normal: $${this.normalPrice}`,
      duration: 4000,
      position: 'bottom',
      color: 'dark',
    });
    toast.present();
  }

  establishPayments(){
    this.subtotal = this.seatCost
    this.iva = this.subtotal * 15 / 100
    this.total = this.subtotal+this.iva
  }

  async saveTicket() {
    try {
      for (let i = 0; i < this.selectedSeat.length; i++) {
        const ticketData = {
          tripId: this.tripId,
          userId: this.userName,
          frecuencyId: this.frecuencyID,
          date: this.selectedDate,
          seatType: this.selectedSeat[i].category,
          seatNumber: `Asiento-${this.selectedSeat[i].number}`,
          total: this.total / this.selectedSeat.length,
          paymentMethod: this.selectedMethod,
          plate: this.busNumber,
          estado: "Por vender",
        };

        await this.firebaseSvc.addSubcollectionDocument(
          'cooperatives',
          this.selectedCooperativeId,
          'boletos',
          ticketData
        );
      }

        for(let j=0;j<this.selectedSeat.length; j++){
            await this.firebaseSvc.updateSeatStatus(
              'cooperatives',
              this.selectedCooperativeId,
              'buses',
              this.selectedBusId,
              'seats',
              this.selectedSeat[j].id,
              'reservado'
            );

            console.log(`Asiento ${this.selectedSeat[j].id} actualizado a 'reservado'`);
      }



      alert('Boletos guardados con éxito');

      this.resetForm();
    } catch (error) {
      console.error('Error al guardar boletos:', error);
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
    this.seatCost = 0;
    this.busNumber = 0;
  }

  //Asientos nueva funcionalidad
  async openSelection(){
    const seatsSorted  = this.seats.sort((a, b) => a.number - b.number);

    console.log(this.seats)
    const modal = await this.modalController.create({
      component:SeatSelectorPage,
       componentProps: {
       seats: seatsSorted
    },
    })
    modal.onDidDismiss().then((data) => {
      if (data.data && data.data.selectedSeats) {
        this.selectedSeat = data.data.selectedSeats;
        console.log('Asientos seleccionados:', this.selectedSeat);
        this.obtainCost()
      }
    });
  await modal.present()
  }


 async obtainSeats() {
  console.log("seatss")
    this.seats = [];
    this.selectedSeat = [];
    this.busIds = [];

console.log("Bus" + this.selectedBusId)

  this.firebaseSvc.getSubcollectionFromPath(
                    'cooperatives',
                    this.selectedCooperativeId,
                    'buses',
                    this.selectedBusId,
                    'seats'
                  ).subscribe(asientos => {
                    asientos.forEach(asiento => {
                      // Verificar si el asiento ya existe para evitar duplicados
                      const seatExists = this.seats.some(existingSeat => existingSeat.number === asiento.number);

                      if (!seatExists) {
                        this.seats.push({
                          id: asiento.id,
                          number: asiento.number,
                          category: asiento.category,
                          status: asiento.status,
                        });
                      }
                    });
                    console.log('Asientos disponibles:', this.seats);
                  });
                }
  }

  const formatToISO = (date: Date | string |null): string => {
    if(date ===null){
      return '';
    }
    const dateObj = new Date(date);
    return dateObj.toISOString();
  };
