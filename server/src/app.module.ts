import {Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {MaterialsModule} from './materials/materials.module';
import {AuthModule} from './auth/auth.module';
import {UsersModule} from './users/users.module';
import {EmailService} from './email/email.service';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {EmailModule} from './email/email.module';
import {PreferencesModule} from './preferences/preferences.module';
import {MediaModule} from './media/media.module';
import {PluginModule} from './plugin/plugin.module';
import {EventsModule} from './events/events.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('DATABASE_URL'),
            }),
            inject: [ConfigService],
        }),
        MaterialsModule, AuthModule, UsersModule, EmailModule, PreferencesModule, MediaModule, PluginModule, EventsModule],
    providers: [EmailService],
})
export class AppModule {
}
