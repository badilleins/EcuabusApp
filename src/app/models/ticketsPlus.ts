export interface TicketPlus {
    ticket_id: string;
    ticket_busNumber: string;
    ticket_date: string;
    ticket_frecuencyId: string;
    ticket_numberOfSeats: string;
    ticket_paymentMethod: string;
    ticket_seatType: string;
    ticket_total: string;
    ticket_tripId: string;
    ticket_userId: string;
    imagen?: string;  // Añadir la propiedad 'imagen' para almacenar el código QR
  }