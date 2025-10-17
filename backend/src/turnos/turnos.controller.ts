import { Controller, Post, Body, Get, Query, BadRequestException, Put, Param, ParseIntPipe } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import type { ActualizarTurnoDto } from './dto/turno.dto';

@Controller('turnos')
export class TurnosController {
  constructor(private turnosService: TurnosService) {}

  @Post()
  async createTurno(@Body() data: {
    usuarioId: number;
    establecimientoId: number;
    fecha: string;
    hora: string;
  }) {
    console.log('[TurnosController] Recibiendo solicitud:', data);
    
    // Validaciones
    if (!data.usuarioId) {
      throw new BadRequestException('usuarioId es requerido');
    }

    if (!data.establecimientoId) {
      throw new BadRequestException('establecimientoId es requerido');
    }

    if (!data.fecha) {
      throw new BadRequestException('fecha es requerida');
    }

    if (!data.hora) {
      throw new BadRequestException('hora es requerida');
    }
    
    try {
      const turno = await this.turnosService.createTurno({
        ...data,
        fecha: new Date(data.fecha)
      });

      console.log('[TurnosController] Turno creado exitosamente');
      return turno;
    } catch (error) {
      console.error('[TurnosController] Error:', error.message);
      throw error;
    }
  }

  @Get()
  async listTurnos(
    @Query('user') userEmail?: string,
    @Query('includeCancelled') includeCancelled?: string,
  ) {
    console.log('[TurnosController] Listando turnos para:', userEmail || 'todos', 'includeCancelled=', includeCancelled);
    const includeCancelledFlag = includeCancelled === 'true' || includeCancelled === '1';
    return this.turnosService.listTurnos(userEmail, includeCancelledFlag);
  }

  /**
   * PUT /turnos/:id
   * Actualiza un turno (por ejemplo para cancelar)
   */
  @Put(':id')
  async updateTurno(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: ActualizarTurnoDto,
  ) {
    console.log('[TurnosController] Update turno:', id, data);
    return this.turnosService.updateTurno(id, data);
  }
}