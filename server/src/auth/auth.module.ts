import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {UsersModule} from "../users/users.module";
import {AuthController} from './auth.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {AuthenticationRequest, AuthenticationRequestSchema} from "./authenticationRequest.schema";
import {ConfigModule} from "@nestjs/config";
import {EmailModule} from "../email/email.module";

@Module({
    imports: [
        MongooseModule.forFeature([{name: AuthenticationRequest.name, schema: AuthenticationRequestSchema}]),
        ConfigModule.forRoot(), UsersModule,
        EmailModule],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {
}
