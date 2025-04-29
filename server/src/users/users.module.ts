import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "./user.schema";
import {UsersController} from './users.controller';
import {ConfigModule} from "@nestjs/config";
import {EmailModule} from "../email/email.module";

@Module({
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
        ConfigModule.forRoot(), EmailModule],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {
}
