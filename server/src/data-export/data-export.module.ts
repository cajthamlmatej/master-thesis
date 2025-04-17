import {Module} from '@nestjs/common';
import {DataExportController} from './data-export.controller';
import {DataExportService} from './data-export.service';
import {MongooseModule} from "@nestjs/mongoose";
import {ConfigModule} from "@nestjs/config";
import {DataExport, DataExportSchema} from "./data-export.schema";
import {MediaModule} from "../media/media.module";
import {AuthModule} from "../auth/auth.module";
import {PluginModule} from "../plugin/plugin.module";
import {PreferencesModule} from "../preferences/preferences.module";
import {MaterialsModule} from "../materials/materials.module";
import {UsersModule} from "../users/users.module";
import {EmailModule} from "../email/email.module";

@Module({
    imports: [
        MediaModule,
        AuthModule,
        PluginModule,
        PreferencesModule,
        MaterialsModule,
        UsersModule,
        EmailModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{name: DataExport.name, schema: DataExportSchema}]),
    ],
    controllers: [DataExportController],
    providers: [DataExportService]
})
export class DataExportModule {
}
