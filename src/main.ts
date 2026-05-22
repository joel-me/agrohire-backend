import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS untuk frontend React
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Validasi DTO otomatis
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Prefix semua route dengan /api
  app.setGlobalPrefix('api');

  // Swagger dokumentasi API
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
