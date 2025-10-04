import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors();
  
  // Configurar prefijo global para API
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT ?? 3000);
  console.log('=========================================');
  console.log('🚀 Backend ejecutándose en puerto 3000');
  console.log('📍 http://localhost:3000');
  console.log('=========================================');
}
bootstrap();