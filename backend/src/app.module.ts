import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Controladores y Servicios base
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Chatbot (Integración)
import { ChatbotController } from './controllers/chatbot.controller';
import { GeminiService } from './services/gemini.service';

// Módulos de SaludMap
import { UsuariosModule } from './usuarios/usuarios.module';
import { TurnosModule } from './turnos/turnos.module';
import { EstablecimientosModule } from './establecimientos/establecimientos.module';
import { ReseniasModule } from './resenias/resenias.module';
import { PlacesModule } from './places/places.module';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    // Configuración Global de Variables de Entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.production'],
    }),

    // Configuración Asíncrona de JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'tu-secreto-super-seguro-cambiar-en-produccion',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),

    // Módulos del Sistema
    PlacesModule,
    ScheduleModule.forRoot(),
    TurnosModule,
    UsuariosModule,
    EstablecimientosModule,
    ReseniasModule,
  ],
  controllers: [
    AppController, 
    ChatbotController // Añadido aquí
  ],
  providers: [
    AppService, 
    JwtAuthGuard, 
    GeminiService // Añadido aquí
  ],
  exports: [JwtAuthGuard],
})
export class AppModule {}