import {NestFactory} from '@nestjs/core';
import {FastifyAdapter, NestFastifyApplication,} from '@nestjs/platform-fastify';
import {AppModule} from './app.module';
import {Logger, ValidationPipe} from "@nestjs/common";
import multipart from "@fastify/multipart";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({bodyLimit: 50048576})
    );

    await app.register(multipart);

    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    app.enableShutdownHooks();

    await app.listen(2020, "0.0.0.0");

    Logger.log('Application is running on: ' + await app.getUrl());
}

bootstrap();