import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	
	// Configurar prefijo global para todas las rutas
	app.setGlobalPrefix('api');
	
	// Habilitar CORS durante desarrollo
	app.enableCors();
	
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
