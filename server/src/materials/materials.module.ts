import {forwardRef, Module} from '@nestjs/common';
import {MaterialsService} from './materials.service';
import {MaterialsController} from './materials.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Material, MaterialSchema} from "./material.schema";
import {UsersModule} from "../users/users.module";
import {ConfigModule} from "@nestjs/config";
import {PluginModule} from "../plugin/plugin.module";
import {MaterialsExportService} from "./materialsExport.service";
import {EventsModule} from "../events/events.module";

@Module({
    imports: [
        MongooseModule.forFeature([{name: Material.name, schema: MaterialSchema}]),
        UsersModule,
        ConfigModule.forRoot(),
        PluginModule,
        forwardRef(() => EventsModule)
    ],
    controllers: [MaterialsController],
    exports: [MaterialsService, MaterialsExportService],
    providers: [MaterialsService, MaterialsExportService],
})
export class MaterialsModule {
}
