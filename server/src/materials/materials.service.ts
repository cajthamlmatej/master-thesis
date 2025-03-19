import {Injectable} from '@nestjs/common';
import {Material} from "./material.schema";
import {HydratedDocument, Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {User} from "../users/user.schema";
import {UpdateMaterialDTO} from "../../dto/material/UpdateMaterialDTO";
import {CreateMaterialDTO} from "../../dto/material/CreateMaterialDTO";

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
            $set: {
                ...updateMaterialDto,
                updatedAt: new Date()
            }
        }).exec();
    }

    async create(param: CreateMaterialDTO, user: HydratedDocument<User>) {
        const material = new this.materialModel({
            ...param,
            user: user._id
        });
        return material.save();
    }

    async remove(material: HydratedDocument<Material>) {
        await this.materialModel.deleteOne({_id: material._id}).exec();
    }

    /**
     * Only saves slide's thumbnails to the database
     * @param material
     */
    async updateThumbnails(material: HydratedDocument<Material>) {
        const bulkOps = material.slides.map((slide) => ({
            updateOne: {
                filter: { _id: material.id, "slides.id": slide.id },
                update: { $set: { "slides.$[elem].thumbnail": slide.thumbnail } },
                arrayFilters: [{ "elem.id": slide.id }]
            }
        }));

        await this.materialModel.bulkWrite(bulkOps);
    }
}
