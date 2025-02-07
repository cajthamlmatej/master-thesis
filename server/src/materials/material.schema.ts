
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from "mongoose";
import {User, UserDocument} from "../users/user.schema";

export type MaterialDocument = HydratedDocument<Material>;

class Slide {
    @Prop()
    id: string;
    @Prop()
    thumbnail: string;
    @Prop()
    position: number;
    @Prop()
    data: string;
}

@Schema()
export class Material {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;

    @Prop()
    name: string;

    @Prop({ default: () => new Date() })
    createdAt: Date;

    @Prop({ default: () => new Date() })
    updatedAt: Date;

    @Prop([Slide])
    slides: Slide[];
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
