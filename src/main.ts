import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCors from '@fastify/cors';
import { cors } from 'src/const/cors';
import { RedisIoAdapter } from 'src/core/adapters/redis-io.adapter';
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
  await app.register(fastifyCors, cors);
  await app.register(fastifyCookie);
  await app.register(fastifyCsrf);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  /* Redis adapter */
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis({
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
  });
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(configService.get('PORT') || 3000);
}

bootstrap();
