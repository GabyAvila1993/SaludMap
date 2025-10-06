import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ParseFloatPipe,
} from '@nestjs/common';
import { EstablecimientosService } from './establecimientos.service';
import { CrearEstablecimientoDto } from './dto/crear-establecimiento.dto';

@Controller('establecimientos')
export class EstablecimientosController {
  constructor(private readonly service: EstablecimientosService) {}

  /**
   * POST /establecimientos
   * Crea un nuevo establecimiento
   */
  @Post()
  async create(@Body() dto: CrearEstablecimientoDto) {
    return await this.service.create(dto);
  }

  /**
   * POST /establecimientos/find-or-create
   * Busca o crea un establecimiento
   */
  @Post('find-or-create')
  async findOrCreate(@Body() dto: CrearEstablecimientoDto) {
    return await this.service.findOrCreate(dto);
  }

  /**
   * GET /establecimientos
   * Lista todos los establecimientos con paginación
   */
  @Get()
  async findAll(
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
  ) {
    return await this.service.findAll(skip, take);
  }

  /**
   * GET /establecimientos/coords/:lat/:lng
   * Busca un establecimiento por coordenadas
   * IMPORTANTE: Debe ir ANTES de la ruta :id para que funcione correctamente
   */
  @Get('coords/:lat/:lng')
  async findByCoordinates(
    @Param('lat', ParseFloatPipe) lat: number,
    @Param('lng', ParseFloatPipe) lng: number,
  ) {
    const establecimiento = await this.service.findByCoordinates(lat, lng);
    return establecimiento || { message: 'No encontrado', found: false };
  }

  /**
   * GET /establecimientos/:id/resenias
   * Obtiene las reseñas de un establecimiento con estadísticas
   * IMPORTANTE: Debe ir ANTES de la ruta :id para que funcione correctamente
   */
  @Get(':id/resenias')
  async getResenias(@Param('id', ParseIntPipe) id: number) {
    return await this.service.getResenias(id);
  }

  /**
   * GET /establecimientos/:id
   * Obtiene un establecimiento por ID
   * IMPORTANTE: Esta ruta genérica debe ir AL FINAL de todas las rutas GET
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.service.findById(id);
  }
}