import {Injectable} from '@nestjs/common';
import {Material} from "./material.schema";
import {HydratedDocument, Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {User} from "../users/user.schema";
import {UpdateMaterialDTO} from "../../dto/material/UpdateMaterialDTO";

@Injectable()
export class MaterialsService {
    constructor(@InjectModel(Material.name) private materialModel: Model<Material>) {
    }

    findAllForUser(user: HydratedDocument<User>) {
        return this.materialModel.find({user: user.id}).exec();
    }

    findById(id: string) {
        return this.materialModel.findById(id).exec();
    }

    async update(material: HydratedDocument<Material>, updateMaterialDto: UpdateMaterialDTO) {
        await this.materialModel.findByIdAndUpdate(material._id, {
            updateMaterialDto,
            updatedAt: new Date()
        }).exec();
    }

    async create(param: {
        slides?: { id: string; data: string; thumbnail?: string; position: number }[];
        name?: string;
        user: HydratedDocument<User>
    }) {
        const material = new this.materialModel(param);
        return material.save();
    }

    async remove(material: HydratedDocument<Material>) {
        await this.materialModel.deleteOne({_id: material._id}).exec();
    }
}
