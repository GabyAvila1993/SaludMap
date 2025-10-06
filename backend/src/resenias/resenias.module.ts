import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ReseniasController } from './resenias.controller';
import { ReseniasService } from './resenias.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule, // ← Asegúrate de que esté importado
    ConfigModule,
  ],
  controllers: [ReseniasController],
  providers: [ReseniasService, JwtAuthGuard],
  exports: [ReseniasService],
})
export class ReseniasModule {}