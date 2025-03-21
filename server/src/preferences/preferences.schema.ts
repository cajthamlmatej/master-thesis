
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from "mongoose";
import {User, UserDocument} from "../users/user.schema";

export type PreferencesDocument = HydratedDocument<Preferences>;

@Schema()
export class Preferences {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;

    @Prop()
    KEEP_EDITOR_TO_FIT_PARENT: boolean;

    @Prop()
    PER_OBJECT_TRANSFORMATION: boolean;

    @Prop()
    ROTATION_SNAPPING_COUNT: number;

    // @Prop()
    // AUTOMATIC_SAVING: boolean;
    //
    // @Prop()
    // AUTOMATIC_SAVING_INTERVAL: number;

    @Prop()
    HISTORY_LIMIT: number;
}

export const PreferencesSchema = SchemaFactory.createForClass(Preferences);
