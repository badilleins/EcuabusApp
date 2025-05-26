export interface Seat {
  category: string;  // Categoría del asiento, por ejemplo, "Normal" o "VIP"
  floor: number;
  number:number;     // Piso en el que se encuentra el asiento
  position: {        // Posición del asiento en el mapa
    left: number;    // Posición horizontal (x) en el mapa
    top: number;     // Posición vertical (y) en el mapa
  };
  status: string;    // Estado del asiento, por ejemplo, "Disponible", "Ocupado"
}
