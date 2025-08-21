import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // habilitar CORS durante desarrollo (si usas proxy no es estrictamente necesario, pero conveniente)
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();