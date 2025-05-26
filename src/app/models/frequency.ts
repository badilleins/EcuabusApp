import { Stopp } from "./stopp";

export interface Frecuency{
  timeStart: string,
  timeEnd: string,
  time: string,
  stops:Stopp[],
  id:string,
  origin:string,
  destiny:string,
  price:string,
  priceVip:string,
  isBlocked:boolean,
  document:string,
}

