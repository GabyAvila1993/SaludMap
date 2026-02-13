import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	
	// Configurar prefijo global para todas las rutas
	app.setGlobalPrefix('api');
	
	// Habilitar CORS durante desarrollo
	app.enableCors();
	
	const port = process.env.PORT ?? 3000;
	
	try {
		await app.listen(port);
		//console.log(`🚀 Aplicación Nest ejecutándose en puerto ${port}`);
	} catch (error: any) {
		if (error.code === 'EADDRINUSE') {
			console.error(`❌ Error: El puerto ${port} ya está en uso`);
			console.error('💡 Soluciones:');
			console.error('   1. Espera 5 segundos y reinicia');
			console.error('   2. Cambia el puerto: PORT=3001 npm run start:dev');
			console.error('   3. Mata el proceso: Ctrl+C en cualquier terminal de Node');
		}
		process.exit(1);
	}
}

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
	console.log('SIGTERM recibido. Cerrando aplicación...');
	process.exit(0);
});

process.on('SIGINT', () => {
	console.log('SIGINT recibido. Cerrando aplicación...');
	process.exit(0);
});

bootstrap();
