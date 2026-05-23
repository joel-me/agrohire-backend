import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // CORS wildcard
  app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
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

  await app.init();
  return server;
}

// Untuk lokal
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(async () => {
    const port = process.env.PORT || 3001;
    server.listen(port, () => {
      console.log(`✅ AgroHire Backend berjalan di: http://localhost:${port}`);
      console.log(`📖 Swagger Docs: http://localhost:${port}/api/docs`);
    });
  });
}

export { bootstrap, server };
