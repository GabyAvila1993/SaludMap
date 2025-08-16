import { Controller, Get, Query } from '@nestjs/common';
import { PlacesService } from './places.service';

@Controller('places') 
export class PlacesController {
  // Inyectamos el servicio que maneja la lógica
  constructor(private readonly placesService: PlacesService) {}

  // Endpoint GET para buscar lugares cercanos
  @Get()
  async buscarLugares(
    @Query('lat') latitud: number,         
    @Query('lng') longitud: number,        
    @Query('types') tipos?: string | string[] 
  ) {
    // Normalizamos el parámetro 'types' para que siempre sea un array
    let tiposDeAmenity: string[] | undefined;

    if (Array.isArray(tipos)) {
      tiposDeAmenity = tipos;
    } else if (typeof tipos === 'string') {
      tiposDeAmenity = tipos.split(',');
    }

    // Llamamos al servicio para obtener los lugares
    const resultado = await this.placesService.obtenerLugares(
      latitud,
      longitud,
      tiposDeAmenity
    );

    return resultado;
  }
}

