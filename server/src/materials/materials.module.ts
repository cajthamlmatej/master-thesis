import {Module} from '@nestjs/common';
import {MaterialsService} from './materials.service';
import {MaterialsController} from './materials.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Material, MaterialSchema} from "./material.schema";
import {UsersModule} from "../users/users.module";
import {ConfigModule} from "@nestjs/config";
import {EmailService} from "../email/email.service";

@Module({
    imports: [MongooseModule.forFeature([{name: Material.name, schema: MaterialSchema}]), UsersModule,
        ConfigModule.forRoot()],
    controllers: [MaterialsController],
    providers: [MaterialsService],
})
export class MaterialsModule {
}
