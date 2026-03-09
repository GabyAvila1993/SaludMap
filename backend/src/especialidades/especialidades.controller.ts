import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EspecialidadesService } from './especialidades.service';
import { CrearEspecialidadDto, AsignarEspecialidadDto } from './dto/especialidad.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';

@Controller('especialidades')
export class EspecialidadesController {
  constructor(private readonly service: EspecialidadesService) {}

  // ── Endpoints públicos (cualquier usuario autenticado o no) ──

  /**
   * GET /especialidades
   * Lista todas las especialidades — público
   */
  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  /**
   * GET /especialidades/establecimiento/:id
   * Especialidades de un establecimiento — público
   */
  @Get('establecimiento/:id')
  async findByEstablecimiento(@Param('id', ParseIntPipe) establecimientoId: number) {
    return await this.service.findByEstablecimiento(establecimientoId);
  }

  /**
   * GET /especialidades/:id
   * Obtiene una especialidad por ID — público
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.service.findById(id);
  }

  // ── Endpoints solo admin ──────────────────────────────────────

  /**
   * POST /especialidades
   * Crea una nueva especialidad — solo admin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() dto: CrearEspecialidadDto) {
    return await this.service.create(dto);
  }

  /**
   * POST /especialidades/asignar
   * Asigna una especialidad a un establecimiento — solo admin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('asignar')
  async asignar(@Body() dto: AsignarEspecialidadDto) {
    return await this.service.asignarAEstablecimiento(dto);
  }

  /**
   * DELETE /especialidades/establecimiento/:establecimientoId/:especialidadId
   * Desasigna una especialidad de un establecimiento — solo admin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('establecimiento/:establecimientoId/:especialidadId')
  async desasignar(
    @Param('establecimientoId', ParseIntPipe) establecimientoId: number,
    @Param('especialidadId', ParseIntPipe) especialidadId: number,
  ) {
    return await this.service.desasignarDeEstablecimiento(establecimientoId, especialidadId);
  }
}