import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {HydratedDocument} from 'mongoose';
import {User} from "../users/user.schema";

export type MediaDocument = HydratedDocument<Media>;

@Schema()
export class Media {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user: User;

    @Prop()
    name: string;

    @Prop()
    mimetype: string;

    @Prop()
    size: number;

    @Prop({enum: ['LOCAL']})
    location: string;

    @Prop()
    path: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);