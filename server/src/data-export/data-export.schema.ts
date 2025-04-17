import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {HydratedDocument} from 'mongoose';
import {User} from "../users/user.schema";
import {DataExportModule} from "./data-export.module";

export type DataExportDocument = HydratedDocument<DataExportModule>;

@Schema()
export class DataExport {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user: User;

    @Prop()
    requestedAt: Date;

    @Prop({
        type: Date,
        required: false
    })
    completedAt: Date | undefined;

    @Prop({
        type: Date,
        required: false
    })
    expiresAt: Date | undefined;
}

export const DataExportSchema = SchemaFactory.createForClass(DataExport);