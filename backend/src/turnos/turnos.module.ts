import { Module } from '@nestjs/common';
import { TurnosController } from './turnos.controller';
import { TurnosService } from './turnos.service';

@Module({
  controllers: [TurnosController],
  providers: [TurnosService],
})
export class TurnosModule {}