import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument, Model} from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {ConfigService} from "@nestjs/config";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop()
    password: string;

    @Prop({default: true})
    active: boolean;

    @Prop({required: false})
    token: string;

    @Prop({default: () => new Date()})
    lastPasswordChange: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
