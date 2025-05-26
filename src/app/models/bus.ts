import { Seat } from "./seat"

export interface Bus{
  arraySeats :Seat[],
  brand:string,
  chasis:string,
  floors:number
  id:string
  idPartner:string,
  model:string,
  plate:string,
  seats:string,
  seatsVip:string,
}
