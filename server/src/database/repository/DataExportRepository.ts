import {HydratedDocument, Types} from "mongoose";
import {Service} from "typedi";
import Repository from "../Repository";
import DataExport, {IDataExport} from "../model/DataExportModel";
import {IUser} from "../model/UserModel";

@Service()
export default class DataExportRepository extends Repository<IDataExport> {
    public async getById(id: string | Types.ObjectId): Promise<HydratedDocument<IDataExport> | null> {
        return DataExport.findById(id);
    }

    public async forUser(userId: string | Types.ObjectId): Promise<HydratedDocument<IDataExport> | null> {
        return DataExport.findOne({
            user: userId
        }).sort({
            createdAt: -1
        });
    }

    public async canCreate(userId: string | Types.ObjectId): Promise<boolean> {
        const finishedAt = (await this.forUser(userId))?.finishedAt;

        if (!finishedAt) return false;

        return ((new Date().getTime() - finishedAt.getTime()) / 1000 / 60 / 60 / 24) < 30;
    }

    public async toBeProcessed() {
        return DataExport.find({
            status: 'PENDING'
        }).sort({
            createdAt: -1
        }).populate<{
            user: HydratedDocument<IUser>;
        }>({
            path: 'user',
        });
    }

    public async update(id: string | Types.ObjectId, data: Partial<IDataExport>) {
        await DataExport.updateOne({
            _id: id
        }, {
            $set: data
        });
    }

    create(id: string | Types.ObjectId) {
        return DataExport.create({
            user: id,
            status: 'PENDING',
            createdAt: new Date(),
            finishedAt: undefined,
            file: undefined
        });
    }

    async findFinished() {
        return DataExport.find({
            status: 'FINISHED'
        });
    }

    async findArchived() {
        return DataExport.find({
            status: 'ARCHIVED'
        });
    }

    async remove(id: string | Types.ObjectId) {
        await DataExport.deleteOne({
            _id: id
        });
    }

    async deleteAllForUser(id: string | Types.ObjectId) {
        await DataExport.deleteMany({
            user: id
        });
    }
}