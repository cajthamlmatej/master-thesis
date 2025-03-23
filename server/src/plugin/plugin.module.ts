import {Module} from '@nestjs/common';
import {PluginService} from './plugin.service';
import {PluginController} from './plugin.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {UsersModule} from "../users/users.module";
import {ConfigModule} from "@nestjs/config";
import {Plugin, PluginSchema} from "./plugin.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{name: Plugin.name, schema: PluginSchema}]),
        UsersModule,
        ConfigModule.forRoot()
    ],
    providers: [PluginService],
    controllers: [PluginController]
})
export class PluginModule {
}
