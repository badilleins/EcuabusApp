export interface TicketPlus {
  ticket_id: string;
  busNumber: string;
  date: string;
  frecuencyId: string;
  seatNumber: string;
  paymentMethod: string;
  seatType: string;
  total: string;
  tripId: string;
  userId: string;
  imagen?: string;
  showDetails?: boolean;
}
