/* --------- INICIO DEL ARCHIVO src/resenias/resenias.controller.ts ----------- */
import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReseniasService } from './resenias.service';
import { CrearReseniaDto } from './dto/crear-resenia.dto';

@Controller('resenias')
export class ReseniasController {
  constructor(private readonly reseniasService: ReseniasService) {}

  @UseGuards(JwtAuthGuard)
  @Get('turnos-para-reseniar')
  async getTurnosParaReseniar(@Request() req, @Query('establecimientoId') establecimientoId?: string) {
    const usuarioId = req.user.userId;
    return this.reseniasService.getTurnosParaReseniar(
      usuarioId, 
      establecimientoId ? +establecimientoId : undefined
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async crear(@Request() req, @Body() dto: CrearReseniaDto) {
    const usuarioId = req.user.userId;
    return this.reseniasService.crear(usuarioId, dto);
  }

  @Get('establecimiento/:id')
  async obtenerResenias(@Param('id') id: string) {
    return this.reseniasService.findByEstablecimiento(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-resenias')
  async misResenias(@Request() req) {
    const usuarioId = req.user.userId;
    return this.reseniasService.findByUsuario(usuarioId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validar/:turnoId')
  async validar(@Param('turnoId') turnoId: string, @Request() req) {
    const usuarioId = req.user.userId;
    return this.reseniasService.validarPuedeReseniar(usuarioId, +turnoId);
  }

  @Get(':id')
  async obtenerResenia(@Param('id') id: string) {
    return this.reseniasService.findById(+id);
  }
}
/* --------- FIN DEL ARCHIVO src/resenias/resenias.controller.ts ----------- */