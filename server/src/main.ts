import {NestFactory} from '@nestjs/core';
import {FastifyAdapter, NestFastifyApplication,} from '@nestjs/platform-fastify';
import {AppModule} from './app.module';
import {ValidationPipe} from "@nestjs/common";
import multipart from "@fastify/multipart";
import { Logger } from '@nestjs/common';

async function bootstrap() {
    console.log(`Application loading...`);

    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter()
    );

    await app.register(multipart);

    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();

    await app.listen(2020, "0.0.0.0");
    
    Logger.log('Application is running on: ' + await app.getUrl());
}

bootstrap();