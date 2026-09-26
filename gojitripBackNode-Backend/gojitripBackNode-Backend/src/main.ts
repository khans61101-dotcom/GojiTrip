import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow frontend ports & domains
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : true;

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Rewrite /api/google/* to /api/v1/google/* for backward/direct compatibility
  app.use((req: any, _res: any, next: any) => {
    if (req.url && req.url.startsWith('/api/google/')) {
      req.url = req.url.replace('/api/google/', '/api/v1/google/');
    }
    next();
  });

  // API prefix (exclude root / route for health check)
  app.setGlobalPrefix('api/v1', { exclude: ['/'] });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global Exception Filter for Detailed Logging
  app.useGlobalFilters(new AllExceptionsFilter());

  // Backend
  const port = process.env.PORT || 8000;

  await app.listen(port, '0.0.0.0');

  console.log(`Backend running on: http://localhost:${port}`);
  console.log('Allowed frontends:');
  console.log('http://localhost:3000');
  console.log('http://localhost:3001');
  console.log('http://localhost:3002');
  console.log('http://localhost:3003');
}

bootstrap();
