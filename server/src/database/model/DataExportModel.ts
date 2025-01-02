import {HydratedDocument, model, Schema, Types} from 'mongoose';
import DataExportDTO from "../../../lib/dto/response/dataExport/DataExportDTO";

interface IDataExport {
    user: Types.ObjectId;
    createdAt: Date;
    finishedAt?: Date;
    status: 'PENDING' | 'FINISHED' | 'ARCHIVED';
    file?: Types.ObjectId;

    toDTO(): DataExportDTO;
}

const dataExportSchema = new Schema<IDataExport>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    finishedAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['PENDING', 'FINISHED', 'ARCHIVED'],
        default: 'PENDING'
    },
    file: {
        type: Schema.Types.ObjectId,
        ref: 'File',
    }
}, {
    timestamps: true
});

dataExportSchema.method<HydratedDocument<IDataExport>>('toDTO', function () {
    return {
        id: this._id.toString(),
        createdAt: this.createdAt,
        finishedAt: this.finishedAt ?? undefined,
        status: this.status,
        file: this.file?.toString(),
    } as DataExportDTO;
});

const DataExport = model<IDataExport>('DataExport', dataExportSchema);

export default DataExport;
export {IDataExport};