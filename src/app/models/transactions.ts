export interface Transaccion {
    fecha: Date; // La fecha que se captura como marca de tiempo (tipo string o Date)
    precio: string; // El precio de la transacción, como cadena de texto
    rutaId: string; // ID de la ruta de la transacción
    userId: string; // ID del usuario que realiza la transacción
    cooperativaName: string; // Nombre de la cooperativa
  }