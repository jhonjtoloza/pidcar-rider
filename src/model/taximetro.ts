export interface Taximetro {
  id: number;
  ciudades_ids: string;
  con_unidades: boolean;
  arranque: number;
  minima: number;
  distancia_mts: number;
  distancia_precio: number;
  segundos: number;
  segundos_precio: number;
  recargo_aeropuerto: number;
  recargo_terminal: number;
  recargo_nocturno: number;
  recargo_puerta_puerta: number;
  precio_unidad: number;
  isFestivo: boolean;
  hora_inicio: string;
  hora_fin: string
}
