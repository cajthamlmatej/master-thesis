import {Module} from '@nestjs/common';
import {MediaController} from './media.controller';
import {MediaService} from './media.service';
import {MongooseModule} from "@nestjs/mongoose";
import {UsersModule} from "../users/users.module";
import {ConfigModule} from "@nestjs/config";
import {Media, MediaSchema} from "./media.schema";
import {diskStorage, FastifyMulterModule} from "fastify-file-interceptor";
import {extname} from 'path';


@Module({
    imports: [
        FastifyMulterModule.register({
            storage: diskStorage({
                destination: './upload/',
                filename(req, file, callback) {
                    const name = file.originalname.split('.')[0];
                    const fileExtName = extname(file.originalname);
                    const randomName = Array(42)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    callback(null, `${name}-${randomName}${fileExtName}`);
                }
            }),
        }),
        MongooseModule.forFeature([{name: Media.name, schema: MediaSchema}]),
        UsersModule,
        ConfigModule.forRoot()
    ],
    controllers: [MediaController],
    providers: [MediaService]
})
export class MediaModule {
}

