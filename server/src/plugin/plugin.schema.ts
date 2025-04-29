import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {HydratedDocument} from 'mongoose';
import {User} from "../users/user.schema";

export type PluginDocument = HydratedDocument<Plugin>;

class PluginRelease {
    @Prop()
    version: string;

    @Prop({default: () => new Date()})
    date: Date;

    @Prop()
    changelog: string;

    @Prop()
    manifest: string;

    @Prop({isRequired: false})
    editorCode: string;

    @Prop({isRequired: false})
    playerCode: string;
}

@Schema()
export class Plugin {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', isRequired: false})
    author: User;

    @Prop()
    name: string;

    @Prop()
    icon: string;

    @Prop()
    description: string;

    @Prop()
    tags: string[];

    @Prop()
    releases: PluginRelease[];
}

export const PluginSchema = SchemaFactory.createForClass(Plugin);