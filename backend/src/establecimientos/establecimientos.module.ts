import { Module } from '@nestjs/common';
import { EstablecimientosController } from './establecimientos.controller';
import { EstablecimientosService } from './establecimientos.service';

@Module({
  controllers: [EstablecimientosController],
  providers: [EstablecimientosService],
  exports: [EstablecimientosService],
})
export class EstablecimientosModule {}
