import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';

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
