import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {HydratedDocument} from 'mongoose';
import {User} from "../users/user.schema";
import {MaterialMethod, MaterialSizing, MaterialVisibility} from "../../dto/material/MaterialEnums";
import {Plugin} from "../plugin/plugin.schema";

export type MaterialDocument = HydratedDocument<Material>;

interface SlideData {
    editor: {
        size: {
            width: number;
            height: number;
        };
        color: string;
    };
    blocks: {
        id: string;
        type: string;
        [key: string]: any;
    }[];
}

class Slide {
    @Prop()
    id: string;
    @Prop()
    thumbnail: string;
    @Prop()
    position: number;
    @Prop({type: mongoose.Schema.Types.Map})
    data: SlideData;
}

class MaterialPlugin {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Plugin'})
    plugin: Plugin;

    @Prop()
    release: string;
}

@Schema()
export class Material {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user: User;

    @Prop()
    name: string;

    @Prop()
    plugins: MaterialPlugin[];

    @Prop()
    visibility: MaterialVisibility;

    @Prop()
    method: MaterialMethod;

    @Prop()
    automaticTime: number;

    @Prop()
    sizing: MaterialSizing;

    @Prop({default: () => new Date()})
    createdAt: Date;

    @Prop({default: () => new Date()})
    updatedAt: Date;

    @Prop([Slide])
    slides: Slide[];
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
