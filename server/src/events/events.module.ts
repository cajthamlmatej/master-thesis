import {forwardRef, Module} from '@nestjs/common';
import {EventsGateway} from './events.gateway';
import {ConfigModule} from "@nestjs/config";
import {UsersModule} from "../users/users.module";
import {MaterialsModule} from "../materials/materials.module";

@Module({
    providers: [EventsGateway],
    imports: [
        UsersModule,
        ConfigModule.forRoot(),
        forwardRef(() => MaterialsModule),
    ],
    exports: [
        EventsGateway
    ]
})
export class EventsModule {
}
