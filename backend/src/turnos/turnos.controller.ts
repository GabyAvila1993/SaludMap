import { Controller, Post, Body, Get, Query, Put, Param } from '@nestjs/common';
import { TurnosService } from './turnos.service';

@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Post()
  create(@Body() payload: any) {
    return this.turnosService.createTurno(payload);
  }

  @Get()
  list(@Query('user') user?: string) {
    return this.turnosService.listTurnos(user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.turnosService.updateTurno(id, body);
  }
}