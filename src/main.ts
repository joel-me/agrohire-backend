import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - izinkan semua origin
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('AgroHire API')
    .setDescription('API Sistem Job Matching Pertanian - Skripsi Joel Alwan Sembiring (2381048)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`✅ AgroHire Backend berjalan di: http://localhost:${port}`);
  console.log(`📖 Swagger Docs: http://localhost:${port}/api/docs`);
}
bootstrap();
