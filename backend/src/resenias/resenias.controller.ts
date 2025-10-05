import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReseniasService } from './resenias.service';
import { CrearReseniaDto } from './dto/crear-resenia.dto';

@Controller('resenias')
export class ReseniasController {
  constructor(private readonly service: ReseniasService) {}

  /**
   * POST /resenias
   * Crea una nueva reseña (requiere autenticación)
   */
  @Post()
  async crear(@Request() req: any, @Body() dto: CrearReseniaDto) {
    // El usuarioId viene del middleware de autenticación
    const usuarioId = req.user?.id || req.user?.userId;
    
    if (!usuarioId) {
      throw new Error('Usuario no autenticado');
    }

    return await this.service.crear(usuarioId, dto);
  }

  /**
   * GET /resenias/validar/:turnoId
   * Valida si el usuario puede reseñar un turno específico
   */
  @Get('validar/:turnoId')
  async validarPuedeReseniar(
    @Request() req: any,
    @Param('turnoId', ParseIntPipe) turnoId: number,
  ) {
    const usuarioId = req.user?.id || req.user?.userId;
    
    if (!usuarioId) {
      throw new Error('Usuario no autenticado');
    }

    return await this.service.validarPuedeReseniar(usuarioId, turnoId);
  }

  /**
   * GET /resenias/establecimiento/:id
   * Obtiene las reseñas de un establecimiento
   */
  @Get('establecimiento/:id')
  async findByEstablecimiento(@Param('id', ParseIntPipe) id: number) {
    return await this.service.findByEstablecimiento(id);
  }

  /**
   * GET /resenias/mis-resenias
   * Obtiene las reseñas del usuario autenticado
   */
  @Get('mis-resenias')
  async misResenias(@Request() req: any) {
    const usuarioId = req.user?.id || req.user?.userId;
    
    if (!usuarioId) {
      throw new Error('Usuario no autenticado');
    }

    return await this.service.findByUsuario(usuarioId);
  }

  /**
   * GET /resenias/turnos-para-reseniar
   * Obtiene los turnos que el usuario puede reseñar
   */
  @Get('turnos-para-reseniar')
  async getTurnosParaReseniar(
    @Request() req: any,
    @Query('establecimientoId', new ParseIntPipe({ optional: true }))
    establecimientoId?: number,
  ) {
    const usuarioId = req.user?.id || req.user?.userId;
    
    if (!usuarioId) {
      throw new Error('Usuario no autenticado');
    }

    return await this.service.getTurnosParaReseniar(
      usuarioId,
      establecimientoId,
    );
  }

  /**
   * GET /resenias/:id
   * Obtiene una reseña específica por ID
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.service.findById(id);
  }
}
