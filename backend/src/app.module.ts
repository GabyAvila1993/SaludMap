import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PlacesModule } from './places/places.module';
import { TurnosModule } from './turnos/turnos.module';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PlacesModule, TurnosModule, AuthModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}