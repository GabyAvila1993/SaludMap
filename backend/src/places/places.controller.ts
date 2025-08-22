import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  async buscarLugares(
    @Query('lat') latStr?: string,
    @Query('lng') lngStr?: string,
    @Query('types') tipos?: string | string[],
    @Query('radius') radius?: string,
  ) {
    const latitud = latStr ? parseFloat(latStr) : NaN;
    const longitud = lngStr ? parseFloat(lngStr) : NaN;

    if (Number.isNaN(latitud) || Number.isNaN(longitud)) {
      throw new BadRequestException('lat y lng son requeridos y deben ser números');
    }

    let tiposDeAmenity: string[] | undefined;
    if (Array.isArray(tipos)) {
      tiposDeAmenity = tipos;
    } else if (typeof tipos === 'string' && tipos.length > 0) {
      tiposDeAmenity = tipos.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const rad = radius ? parseInt(radius, 10) : 3000;

    const resultado = await this.placesService.obtenerLugares(latitud, longitud, tiposDeAmenity, rad);
    return resultado;
  }
}
