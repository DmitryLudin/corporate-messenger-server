import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from 'src/modules/app.module';
import helmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifyCsrf from '@fastify/csrf-protection';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  await app.register(helmet);
  await app.register(fastifyCookie);
  await app.register(fastifyCsrf);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  await app.listen(configService.get('PORT') || 3000);
}

bootstrap();
