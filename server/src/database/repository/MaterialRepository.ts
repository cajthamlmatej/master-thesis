import {HydratedDocument, Types} from "mongoose";
import {Service} from "typedi";
import Repository from "../Repository";
import Material, {IMaterial} from "../model/MaterialModel";

@Service()
export default class MaterialRepository extends Repository<IMaterial> {

    public async getById(id: string | Types.ObjectId): Promise<HydratedDocument<IMaterial> | null> {
        return Material.findById(id);
    }

    public async getForUser(userId: string | Types.ObjectId): Promise<HydratedDocument<IMaterial>[]> {
        return Material.find({user: userId});
    }

    public async getAll(): Promise<HydratedDocument<IMaterial>[]> {
        return Material.find();
    }

    public async create(data: {
        name: string,
        slides: {
            id: string,
            data: string
        }[]
    }) {
        return Material.create(data);
    }

    async update(id: string, data: any) {
        let changes = {} as Record<string, any>;

        if (data.name) changes['name'] = data.name;
        if (data.slides) changes['slides'] = data.slides;

        const updated = await Material.findByIdAndUpdate(id,
            {
                $set: changes
            });

        if(!updated) throw new Error("Material not found");

        return updated;
    }

    async exists(id: string) {
        return !!(await Material.exists({_id: id}));
    }
}