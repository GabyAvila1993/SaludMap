import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Controladores y Servicios base
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Chatbot
import { ChatbotController } from './controllers/chatbot.controller';
import { GeminiService } from './services/gemini.service';

// Módulos de SaludMap
import { UsuariosModule } from './usuarios/usuarios.module';
import { TurnosModule } from './turnos/turnos.module';
import { EstablecimientosModule } from './establecimientos/establecimientos.module';
import { ReseniasModule } from './resenias/resenias.module';
import { PlacesModule } from './places/places.module';
import { EspecialidadesModule } from './especialidades/especialidades.module';

// Guards
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard'; // NUEVO

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.production'],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'tu-secreto-super-seguro-cambiar-en-produccion',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
    PlacesModule,
    ScheduleModule.forRoot(),
    TurnosModule,
    UsuariosModule,
    EstablecimientosModule,
    ReseniasModule,
    EspecialidadesModule,
  ],
  controllers: [AppController, ChatbotController],
  providers: [
    AppService,
    JwtAuthGuard,
    GeminiService,
    RolesGuard, // NUEVO
  ],
  exports: [JwtAuthGuard],
})
export class AppModule {}