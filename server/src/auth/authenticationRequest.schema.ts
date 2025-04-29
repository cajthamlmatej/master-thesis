import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {HydratedDocument} from 'mongoose';
import {User} from "../users/user.schema";

export type AuthenticationRequestDocument = HydratedDocument<AuthenticationRequest>;

@Schema()
export class AuthenticationRequest {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user: User;

    @Prop()
    code: string;

    @Prop()
    expiresAt: Date;

    @Prop({default: false})
    used: boolean;
}

export const AuthenticationRequestSchema = SchemaFactory.createForClass(AuthenticationRequest);
