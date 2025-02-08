import {Module} from '@nestjs/common';
import {PreferencesService} from './preferences.service';
import {MongooseModule} from "@nestjs/mongoose";
import {UsersModule} from "../users/users.module";
import {ConfigModule} from "@nestjs/config";
import {PreferencesController} from "./preferences.controller";
import {Preferences, PreferencesSchema} from "./preferences.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{name: Preferences.name, schema: PreferencesSchema}]),
        UsersModule,
        ConfigModule.forRoot()],
    controllers: [PreferencesController],
    providers: [PreferencesService],
})
export class PreferencesModule {
}
