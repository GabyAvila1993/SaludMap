import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PlacesModule } from './places/places.module';
import { AppService } from './app.service';

@Module({
  imports: [PlacesModule],
})
export class AppModule {}
