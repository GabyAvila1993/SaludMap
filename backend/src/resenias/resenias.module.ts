import { Module } from '@nestjs/common';
import { ReseniasController } from './resenias.controller';
import { ReseniasService } from './resenias.service';

@Module({
  controllers: [ReseniasController],
  providers: [ReseniasService],
  exports: [ReseniasService],
})
export class ReseniasModule {}
