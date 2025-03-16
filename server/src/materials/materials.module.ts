import {Module} from '@nestjs/common';
import {MaterialsService} from './materials.service';
import {MaterialsController} from './materials.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Material, MaterialSchema} from "./material.schema";
import {UsersModule} from "../users/users.module";
import {ConfigModule} from "@nestjs/config";
import {EmailService} from "../email/email.service";
import {PluginModule} from "../plugin/plugin.module";
import {MaterialsExportService} from "./materialsExport.service";

@Module({
    imports: [
        MongooseModule.forFeature([{name: Material.name, schema: MaterialSchema}]), UsersModule,
        ConfigModule.forRoot(),
        PluginModule
    ],
    controllers: [MaterialsController],
    providers: [MaterialsService, MaterialsExportService],
})
export class MaterialsModule {
}
