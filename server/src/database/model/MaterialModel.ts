import {HydratedDocument, model, Schema, Types} from 'mongoose';
import DataExportDTO from "../../../lib/dto/response/dataExport/DataExportDTO";
import {MaterialDTO} from "../../../lib/dto/response/material/MaterialDTO";

interface IMaterial {
    user: Types.ObjectId;
    createdAt: Date;
    name: string;

    slides: {
        id: string;
        data: string;
        thumbnail: string | undefined;
        position: number;
        // TODO: Add more fields
    }[];

    toDTO(): MaterialDTO;
}

const materialSchema = new Schema<IMaterial>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    slides: [{
        id: String,
        thumbnail: String,
        position: Number,
        data: {
            type: String,
        }
    }]
});

materialSchema.method<HydratedDocument<IMaterial>>('toDTO', function () {
    return {
        id: this._id.toString(),
        createdAt: this.createdAt,
        name: this.name,
        slides: this.slides.map((slide) => ({
            id: slide.id,
            thumbnail: slide.thumbnail,
            position: slide.position,
            data: slide.data
        }))
    } as MaterialDTO;
});

const Material = model<IMaterial>('Material', materialSchema);

export default Material;
export {IMaterial};