import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { PlacesModule } from './places/places.module';
import { TurnosModule } from './turnos/turnos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { EstablecimientosModule } from './establecimientos/establecimientos.module';
import { ReseniasModule } from './resenias/resenias.module';
import { AppService } from './app.service';
import { authMiddleware } from './middleware/auth.middleware';

@Module({
	imports: [
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
		// Proteger endpoints de reseñas que requieren autenticación
		consumer
			.apply(authMiddleware)
			.forRoutes(
				'resenias/validar/*',
				'resenias/mis-resenias',
				'resenias/turnos-para-reseniar',
			);

		// Proteger POST de reseñas
		consumer.apply(authMiddleware).forRoutes({
			path: 'resenias',
			method: 'POST' as any,
		});
	}
}
