import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import multipart from "@fastify/multipart";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter()
  );

  await app.register(multipart);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.listen(2020);
}
bootstrap();