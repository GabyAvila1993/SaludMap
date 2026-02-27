import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Cargar variables de entorno al inicio
dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Configurar prefijo global para todas las rutas (Importante para SaludMap)
    app.setGlobalPrefix('api');

    // Configuración de CORS combinada
    app.enableCors({
        origin: '*', // En producción podrías querer restringir esto
        methods: 'GET,POST,PUT,DELETE',
        credentials: true,
    });

    const port = process.env.PORT || 3000;

    try {
        await app.listen(port);
        //console.log(`🚀 Servidor de SaludMap + Chatbot corriendo en: http://localhost:${port}/api`);
    } catch (error: any) {
        if (error.code === 'EADDRINUSE') {
            console.error(`❌ Error: El puerto ${port} ya está en uso`);
            console.error('💡 Soluciones:');
            console.error('   1. Espera 5 segundos y reinicia');
            console.error('   2. Cambia el puerto: PORT=3001 npm run start:dev');
            console.error('   3. Mata el proceso previo');
        } else {
            console.error('Error al iniciar la aplicación:', error);
        }
        process.exit(1);
    }
}

// Manejo de señales para cierre limpio (Graceful shutdown)
const handleExit = (signal: string) => {
    //console.log(`${signal} recibido. Cerrando aplicación de forma segura...`);
    process.exit(0);
};

process.on('SIGTERM', () => handleExit('SIGTERM'));
process.on('SIGINT', () => handleExit('SIGINT'));

bootstrap();