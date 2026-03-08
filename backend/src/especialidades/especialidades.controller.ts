import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { EspecialidadesService } from './especialidades.service';
import { CrearEspecialidadDto, AsignarEspecialidadDto } from './dto/especialidad.dto';

@Controller('especialidades')
export class EspecialidadesController {
  constructor(private readonly service: EspecialidadesService) {}

  /**
   * GET /especialidades
   * Lista todas las especialidades
   */
  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  /**
   * GET /especialidades/:id
   * Obtiene una especialidad por ID
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.service.findById(id);
  }

  /**
   * GET /especialidades/establecimiento/:id
   * Obtiene todas las especialidades de un establecimiento específico
   */
  @Get('establecimiento/:id')
  async findByEstablecimiento(@Param('id', ParseIntPipe) establecimientoId: number) {
    return await this.service.findByEstablecimiento(establecimientoId);
  }

  /**
   * POST /especialidades
   * Crea una nueva especialidad (admin)
   */
  @Post()
  async create(@Body() dto: CrearEspecialidadDto) {
    return await this.service.create(dto);
  }

  /**
   * POST /especialidades/asignar
   * Asigna una especialidad a un establecimiento
   */
  @Post('asignar')
  async asignar(@Body() dto: AsignarEspecialidadDto) {
    return await this.service.asignarAEstablecimiento(dto);
  }

  /**
   * DELETE /especialidades/establecimiento/:establecimientoId/:especialidadId
   * Desasigna una especialidad de un establecimiento
   */
  @Delete('establecimiento/:establecimientoId/:especialidadId')
  async desasignar(
    @Param('establecimientoId', ParseIntPipe) establecimientoId: number,
    @Param('especialidadId', ParseIntPipe) especialidadId: number,
  ) {
    return await this.service.desasignarDeEstablecimiento(establecimientoId, especialidadId);
  }
}