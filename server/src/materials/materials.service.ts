import {Injectable} from '@nestjs/common';
import {Material} from "./material.schema";
import {HydratedDocument, Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {User} from "../users/user.schema";
import {UpdateMaterialDTO} from "../../dto/material/UpdateMaterialDTO";
import {CreateMaterialDTO} from "../../dto/material/CreateMaterialDTO";

interface FeaturedMaterial {
    id: string;
    user: string;
    thumbnail: string;
    name: string;
}

@Injectable()
export class MaterialsService {
    private featured: FeaturedMaterial[] = [];
    constructor(@InjectModel(Material.name) private materialModel: Model<Material>) {
        this.getFeatured();

        setInterval(() => {
            this.getFeatured();
        }, 1000 * 60 * 60);
    }

    private async getFeatured() {
        const aggregate = await this.materialModel.aggregate([
            { $match: { featured: true, visibility: "PUBLIC" } },
            { $sample: { size: 20 } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    user: 1,
                    'slides': { $slice: ['$slides', 1] },
                }
            },
            {
                $addFields: {
                    thumbnail: { $arrayElemAt: ['$slides.thumbnail', 0] }
                }
            },
            {
                $project: {
                    slides: 0
                }
            }
        ]).exec();

        await this.materialModel.populate(aggregate, { path: "user", select: { name: 1 } });

        this.featured = aggregate.map(featured => {
            return {
                id: featured._id.toString(),
                user: featured.user.name.toString(),
                thumbnail: featured.thumbnail,
                name: featured.name
            }
        })
    }

    findAllForUser(user: HydratedDocument<User>) {
        return this.materialModel.find({
            $or: [
                {
                    user: user._id
                },
                {
                    attendees: user._id
                }
            ]
        });
    }

    findById(id: string) {
        return this.materialModel.findById(id).exec();
    }

    async update(material: HydratedDocument<Material>, updateMaterialDto: UpdateMaterialDTO | Omit<UpdateMaterialDTO, "attendees"> & {attendees?: HydratedDocument<User>[]}) {
        await this.materialModel.findByIdAndUpdate(material._id, {
            $set: {
                ...updateMaterialDto,
                updatedAt: new Date()
            }
        }).exec();
    }

    async create(param: CreateMaterialDTO, user: HydratedDocument<User>) {
        const material = new this.materialModel({
            featured: false,
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
                filter: {_id: material.id, "slides.id": slide.id},
                update: {$set: {"slides.$[elem].thumbnail": slide.thumbnail}},
                arrayFilters: [{"elem.id": slide.id}]
            }
        }));

        try {
            await this.materialModel.bulkWrite(bulkOps);
        } catch (e) {
            console.error("Unable to update thumbnails", e);
        }
    }

    async getFeaturedMaterials() {
        return this.featured;
    }

    updateFeatured() {
        this.getFeatured();
    }
}
