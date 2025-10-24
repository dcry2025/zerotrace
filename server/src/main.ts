// main.ts

// Nest js
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';

// Other packages
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';

// Modules
import { AppModule } from './app.module';

/**
 * Initializes and starts the application.
 * Configures global middleware, Swagger, and application settings.
 */
async function bootstrap() {
  // Initialize Fastify adapter
  const fastifyAdapter = new FastifyAdapter({
    logger: false,
    trustProxy: true, // For nginx or another proxy
  });

  // Initialize app with Fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  const configService = app.get(ConfigService);

  // Client
  const origins = configService
    .get<string>('FRONTEND_ORIGIN')
    ?.split(',')
    .map(origin => origin.trim());

  // Global prefix
  app.setGlobalPrefix('/api/v11337', {
  //  exclude: ['/metrics'],
  });

  // Register Fastify helmet plugin for security headers
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  // Register Fastify cookie plugin
  await app.register(fastifyCookie);

  // Enable CORS
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    optionsSuccessStatus: 204,
  });

  // Using Winston logger for NestJS system logs
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Using Winston logger for manual logging
  const logger = app.get(Logger);
  const PORT = configService.get<number>('PORT') || 7000;
  const NODE_ENV = configService.get<string>('NODE_ENV');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // removes properties that are not defined in the DTO
      forbidNonWhitelisted: true, // throws an error if extra (non-whitelisted) properties are present
      transform: true, // automatically transforms payloads to match the DTO enums (e.g., string → number)
    }),
  );

  // App starts - Fastify listen accepts host as second parameter
  await app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Server started on port ${PORT} in ${NODE_ENV} regime at ${new Date()}`,
    );
    logger.log(
      `Server started on port ${PORT} in ${NODE_ENV} regime at ${new Date()}`,
    );
  });
}

bootstrap();
