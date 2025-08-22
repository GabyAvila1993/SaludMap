import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PlacesModule } from './places/places.module';
import { TurnosModule } from './turnos/turnos.module';
import { AppService } from './app.service';

@Module({
  imports: [PlacesModule, TurnosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
