import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  /**  Configuración de Swagger */
  const config = new DocumentBuilder()
    .setTitle('Usuarios API')
    .setDescription('API para gestionar usuarios')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);  // Ruta de la documentación

  await app.listen(8080);
}

bootstrap();
