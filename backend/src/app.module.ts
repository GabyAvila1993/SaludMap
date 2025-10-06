/* --------- INICIO DEL ARCHIVO src/app.module.ts ----------- */
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from './middleware/auth.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TurnosModule } from './turnos/turnos.module';
import { EstablecimientosModule } from './establecimientos/establecimientos.module';
import { ReseniasModule } from './resenias/resenias.module';
import { PlacesModule } from './places/places.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.production'],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET,
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h'
        },
      }),
      inject: [ConfigService],
    }),
    PlacesModule,
    TurnosModule,
    UsuariosModule,
    EstablecimientosModule,
    ReseniasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'resenias/turnos-para-reseniar', method: RequestMethod.GET },
        { path: 'resenias/validar/:turnoId', method: RequestMethod.GET },
        { path: 'resenias/mis-resenias', method: RequestMethod.GET },
        { path: 'resenias', method: RequestMethod.POST }
      );
  }
}
/* --------- FIN DEL ARCHIVO src/app.module.ts ----------- */