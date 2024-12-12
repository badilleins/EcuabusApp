import { Component, inject } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Cooperatives } from '../models/cooperatives';
import { Route } from '../models/route';
import { Frecuency } from '../models/frequency';
import { Bus } from '../models/bus';
import { Seat } from '../models/seat';
import { Trip } from '../models/trip';



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  firebaseSvc=inject(FirebaseService)

  cooperatives:any[]=[]
  routes:Route[]=[]
  buses:any[]=[]
  frecuencies: Frecuency[]=[]
  trips: Trip[]=[]

  selectedCooperative:string="";
  selectedOrigin: string = "";
  selectedDestination: string="";
  selectedDate: Date = new Date();
  selectedHour: string="";
  selectedSeat:string="";
  selectedSeatsNumber: string = "";
  selectedMethod: string="";
  selectedCooperativeId = "";


  cooperativesNames : string[]=[];
  cooperativesIDNames:Object[] = []
  origins :string[]=[];
  originsFiltered:string[]=[]
  destinationsFiltered:string[]=[]
  destinations :string[]= [];
  stops :string[]=[];
  cooperativeSeats: string[]=[]
  cooperativeBuses:string[]=[]

  seatTypes:string[]=[]


  hours :string []= [];
  hoursFiltered:string[]=[]
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


  daysInMonthWithPlaceholders: (number | null)[] = [];

  //Detalles
  seatCost  : number =0
  busNumber : number = 0
  busIds:string[]=[]


  ngOnInit(){
    this.obtainCooperatives()
    this.updateCalendar();

}

  currentList: number = 1;


  goNext() {
      for(let i =0; i < this.frecuencies.length; i++){
        if(this.frecuencies[i].hour_start == this.selectedHour){
          for(let j=0; j< this.routes.length; j++){
            if(this.routes[j].route_start==this.selectedOrigin &&(this.routes[j].route_end==this.selectedDestination ||  this.routes[j].route_stops.includes(this.selectedDestination))){
              if(this.routes[j].route_id==this.frecuencies[i].id_route){
                this.obtainBuses()
                this.obtainSeats(this.frecuencies[i].id_freq)
              }
            }
          }
        }
      }
    this.currentList = 2;
  }


  goBack() {
    this.currentList = 1;
  }
  goPayOrder(){
    this.currentList = 3;
  }



  constructor() {
  }

  onSelectionChange() {

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
  async obtainCooperatives(){
    this.firebaseSvc.getAllDocuments('cooperatives').subscribe(documents => {
      // Guardar los documentos obtenidos
      this.cooperatives = documents;
      console.log(this.cooperatives)
      // Extraer los nombres de las cooperativas
      this.cooperativesNames = this.cooperatives.map(coop => coop.name);
      // Verificar en consola
      console.log('Nombres de cooperativas:', this.cooperativesNames);
      this.obtainFrecuencies()
    }, error => {
      console.error('Error al obtener cooperativas:', error);
    });
}

  async obtainFrecuencies(){
    this.frecuencies = []
    if(!this.selectedCooperative || this.selectedCooperative.trim() === ''){
      for(let i=0; i<this.cooperatives.length;i++){
        this.firebaseSvc.getSubcolection('cooperatives',this.cooperatives[i].id,'frecuencias')
        .subscribe(frecuencias =>{
          frecuencias.forEach(frecuencia=>{
             const frecuencieModel:Frecuency ={
              hour_start: frecuencia.hour_start,
              hour_end: frecuencia.hour_end,
              days: frecuencia.days,
              available:frecuencia.available,
              direct:frecuencia.direct,
              id_route:frecuencia.id_route,
              id_freq:frecuencia.id
            };
            this.frecuencies.push(frecuencieModel)
        });
      });
    }
    }
    else {
      let selectedCooperativeId = ""
      for(let i=0; i < this.cooperatives.length;i++){
          if(this.selectedCooperative===this.cooperatives[i].name){
            selectedCooperativeId = this.cooperatives[i].id
          }
      }
      this.firebaseSvc
        .getSubcolection('cooperatives', selectedCooperativeId, 'frecuencias')
        .subscribe(frecuencias =>{
          frecuencias.forEach(frecuencia=>{
             const frecuencieModel:Frecuency ={
              hour_start: frecuencia.hour_start,
              hour_end: frecuencia.hour_end,
              days: frecuencia.days,
              available:frecuencia.available,
              direct:frecuencia.direct,
              id_route:frecuencia.id_route,
              id_freq:frecuencia.id
            };
            if(frecuencieModel.available){
              this.frecuencies.push(frecuencieModel)
            }
        });
      });
    }
    this.obtainRoutes()
  }

  async obtainRoutes(){
    this.routes = []
    this.origins=[]
    this.destinations=[]
    if(!this.selectedCooperative || this.selectedCooperative.trim() === ''){
    for(let i=0; i<this.cooperatives.length;i++){
      this.firebaseSvc.getSubcolection('cooperatives',this.cooperatives[i].id,'Rutas')
      .subscribe(rutas =>{
        rutas.forEach(ruta=>{
           const rutaRoute:Route ={
            route_start:ruta.route_start || '',
            route_end:ruta.route_end || '',
            route_stops:ruta.route_stops||[],
            route_id:ruta.id
          };
          for (let i=0;i<this.frecuencies.length;i++) {
            if(rutaRoute.route_id===this.frecuencies[i].id_route){
              console.log("entre")
              this.routes.push(rutaRoute)
              this.obtainOrigins()
              this.obtainDestinations()
              this.obtainHours()
              this.origins.push(rutaRoute.route_start)
              this.originsFiltered.push(rutaRoute.route_start)
              this.destinations.push(rutaRoute.route_end);
              this.destinationsFiltered.push(rutaRoute.route_end);
              this.hours.push(this.frecuencies[i].hour_start)
              this.hoursFiltered.push(this.frecuencies[i].hour_start)
            }
          }

      });
    });
  }
  }
  else {
    for(let i=0; i < this.cooperatives.length;i++){
        if(this.selectedCooperative===this.cooperatives[i].name){
          this.selectedCooperativeId = this.cooperatives[i].id
        }
    }
    this.firebaseSvc
      .getSubcolection('cooperatives', this.selectedCooperativeId, 'Rutas')
      .subscribe(rutas => {
        rutas.forEach(ruta => {
          const rutaRoute: Route = {
            route_start: ruta.route_start || '',
            route_end: ruta.route_end || '',
            route_stops: ruta.route_stops || [],
            route_id:ruta.id
          };
          for (let i=0;i<this.frecuencies.length;i++) {
            if(rutaRoute.route_id===this.frecuencies[i].id_route){
              console.log("entre2")
              this.routes.push(rutaRoute)
              this.obtainOrigins()
              this.obtainDestinations()
              this.obtainHours()
              this.origins.push(rutaRoute.route_start)
              this.destinations.push(rutaRoute.route_end);
              // this.destinations.push(...rutaRoute.route_stops);
              this.hours.push(this.frecuencies[i].hour_start)
              this.hoursFiltered.push(this.frecuencies[i].hour_start)
            }
          }
      });
      });
  }
  console.log(this.routes)
}
              obtainOrigins(){
                if(this.selectedDestination !==""){
                  this.originsFiltered = []
                  console.log("Obtengo origen 1")
                  for(let i=0 ; i <this.routes.length;i++){
                    if(this.selectedDestination==this.routes[i].route_end){
                      this.originsFiltered.push(this.routes[i].route_start)
                    }
                  }
                }
                this.loadEnableDays()

                }

              obtainDestinations(){
                if(this.selectedOrigin!==""){
                  this.destinationsFiltered = []
                  for(let i=0 ; i <this.routes.length;i++){
                    if(this.selectedOrigin==this.routes[i].route_start){
                      this.destinationsFiltered.push(this.routes[i].route_end)
                    }
                  }
                }
                this.loadEnableDays()

              }

              obtainHours(){
                  if(this.selectedOrigin!=="" && this.selectedDestination!==""){
                      this.hoursFiltered =[]
                      for(let i=0; i<this.routes.length;i++){
                          if(this.selectedOrigin==this.routes[i].route_start&&this.selectedDestination==this.routes[i].route_end){
                            for(let j=0; j< this.frecuencies.length ; j++){
                              console.log(this.routes[i].route_id)
                              console.log(this.frecuencies[j].id_route)

                              if(this.routes[i].route_id==this.frecuencies[j].id_route){
                                this.hoursFiltered.push(this.frecuencies[j].hour_start)
                              }
                            }

                          }
                      }
                  }
                  this.loadEnableDays()
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


              isEnabled(day: number | null): boolean {
                if (day === null) return false;
                const date = new Date(this.currentYear, this.currentMonth, day);
                return this.enabledWeekdays.has(date.getDay());
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

loadEnableDays(){
  this.enabledWeekdays.clear()
    for (let i = 0; i < this.routes.length; i++) {
      if (
        this.selectedOrigin === this.routes[i].route_start &&
        this.selectedDestination === this.routes[i].route_end
      ) {
        for (let j = 0; j < this.frecuencies.length; j++) {
          if (this.routes[i].route_id === this.frecuencies[j].id_route) {
            const frecuency = this.frecuencies[j];

            if (frecuency.days && Array.isArray(frecuency.days)) {
              frecuency.days.forEach((day) => {
                switch (day) {
                  case "Lunes":
                    this.enabledWeekdays.add(1);
                    break;
                  case "Martes":
                    this.enabledWeekdays.add(2);
                    break;
                  case "Miércoles":
                    this.enabledWeekdays.add(3);
                    break;
                  case "Jueves":
                    this.enabledWeekdays.add(4);
                    break;
                  case "Viernes":
                    this.enabledWeekdays.add(5);
                    break;
                  case "Sábado":
                    this.enabledWeekdays.add(6);
                    break;
                  case "Domingo":
                    this.enabledWeekdays.add(0);
                    break;
                  default:
                    console.warn(`Día no reconocido: ${day}`);
                }
              });
            }
          }
        }
      }
    }
}

obtainSeats(cooperative: string | null) {
  if (!cooperative) return;

  this.busIds = [];
  this.trips = [];
  this.seats = [];

  this.firebaseSvc.getSubcolection('cooperatives', this.selectedCooperativeId, 'buses')
    .subscribe(buses => {
      buses.forEach(bus => {
        this.busIds.push(bus.id);
      });
      console.log('IDs de buses:', this.busIds);

      this.busIds.forEach(busId => {
        // Obtener los viajes del bus
        this.firebaseSvc.getSubcollectionFromPath(
          'cooperatives',
          this.selectedCooperativeId,
          'buses',
          busId,
          'viajes'
        ).subscribe(viajes => {
          viajes.forEach(viaje => {
            if (viaje.freq_id === cooperative) {
              this.trips.push({ ...viaje, busId });

              const matchingBus = buses.find(bus => bus.id === busId);
              console.log(buses)

              console.log(matchingBus)
              if (matchingBus) {
                this.busNumber = matchingBus.bus_number;
                console.log(this.busNumber)
              }


              this.firebaseSvc.getSubcollectionFromPath(
                'cooperatives',
                this.selectedCooperativeId,
                'buses',
                busId,
                'asientos'
              ).subscribe(asientos => {
                asientos.forEach(asiento => {
                  this.seats.push({ ...asiento, busId });
                  this.seatTypes.push(asiento.category)
                });
                console.log('Asientos disponibles:', this.seats);

              });
            }
          });

        });
      });
    });
}

  obtainBuses(){
    this.firebaseSvc.getSubcolection(
      'cooperatives',
      this.selectedCooperative,
      'buses'
    )
    .subscribe(buses => {
      buses.forEach(bus => {
          buses.push(bus)
      })
    })
  }
  obtainCost(){
    console.log(this.seats)
    if(this.selectedSeat!=""){
      if(this.selectedSeat==this.seats[0].category){
          this.seatCost = this.trips[0].seat_normal_cost
      }else{
        this.seatCost=this.trips[0].seat_vip_cost
      }
    }
  }

  obtainSeatsNumber() {
    if (this.selectedSeat !== "") {
      if (this.selectedSeat === this.seats[0].category) {
        console.log("Normal")
        this.availableSeats = [];
        for (let i = this.seats[0].number; i >= 1; i--) {
          this.availableSeats.push(i);
        }
      } else if (this.selectedSeat === this.seats[1].category) {
        console.log("VIP")
        this.availableSeats = [];
        for (let i = this.seats[1].number; i >= 1; i--) {
          this.availableSeats.push(i);
        }
      } else {
        this.availableSeats = [];
      }
    } else {
      this.availableSeats = [];
    }
  }


}


