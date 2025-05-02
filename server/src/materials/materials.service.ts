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

/**
 * Service for managing materials, including CRUD operations, 
 * featured materials, and thumbnail updates.
 */
@Injectable()
export class MaterialsService {
    private featured: FeaturedMaterial[] = [];

    /**
     * Initializes the service and sets up periodic updates for featured materials.
     * @param materialModel - The Mongoose model for materials.
     */
    constructor(@InjectModel(Material.name) private materialModel: Model<Material>) {
        this.getFeatured();

        setInterval(() => {
            this.getFeatured();
        }, 1000 * 60 * 60);
    }

    /**
     * Finds all materials associated with a specific user, either as the owner or an attendee.
     * @param user - The user document to search materials for.
     * @returns A promise resolving to the list of materials.
     */
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

    /**
     * Finds a material by its ID.
     * @param id - The ID of the material to find.
     * @returns A promise resolving to the material document or null if not found.
     */
    findById(id: string): Promise<HydratedDocument<Material> | null> {
        return this.materialModel.findById(id).exec();
    }

    /**
     * Updates a material with new data.
     * @param material - The material document to update.
     * @param updateMaterialDto - The data to update the material with.
     */
    async update(material: HydratedDocument<Material>, updateMaterialDto: UpdateMaterialDTO | Omit<UpdateMaterialDTO, "attendees"> & {
        attendees?: HydratedDocument<User>[]
    }) {
        await this.materialModel.findByIdAndUpdate(material._id, {
            $set: {
                ...updateMaterialDto,
                updatedAt: new Date()
            }
        }).exec();
    }

    /**
     * Creates a new material.
     * @param param - The data for the new material.
     * @param user - The user creating the material.
     * @returns A promise resolving to the created material document.
     */
    async create(param: CreateMaterialDTO, user: HydratedDocument<User>) {
        const material = new this.materialModel({
            featured: false,
            ...param,
            user: user._id
        });
        return material.save();
    }

    /**
     * Removes a material from the database.
     * @param material - The material document to remove.
     */
    async remove(material: HydratedDocument<Material>) {
        await this.materialModel.deleteOne({_id: material._id}).exec();
    }

    /**
     * Updates only the thumbnails of a material's slides in the database.
     * @param material - The material document containing the slides to update.
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

    /**
     * Retrieves the list of featured materials.
     * @returns A promise resolving to the list of featured materials.
     */
    async getFeaturedMaterials() {
        return this.featured;
    }

    /**
     * Triggers an update of the featured materials list.
     */
    updateFeatured() {
        this.getFeatured();
    }

    /**
     * Fetches and updates the list of featured materials from the database.
     * This method is private and used internally.
     */
    private async getFeatured() {
        const aggregate = await this.materialModel.aggregate([
            {$match: {featured: true, visibility: "PUBLIC"}},
            {$sample: {size: 20}},
            {
                $project: {
                    _id: 1,
                    name: 1,
                    user: 1,
                    'slides': {$slice: ['$slides', 1]},
                }
            },
            {
                $addFields: {
                    thumbnail: {$arrayElemAt: ['$slides.thumbnail', 0]}
                }
            },
            {
                $project: {
                    slides: 0
                }
            }
        ]).exec();

        await this.materialModel.populate(aggregate, {path: "user", select: {name: 1}});

        this.featured = aggregate.map(featured => {
            return {
                id: featured._id.toString(),
                user: featured.user.name.toString(),
                thumbnail: featured.thumbnail,
                name: featured.name
            }
        })
    }
}
