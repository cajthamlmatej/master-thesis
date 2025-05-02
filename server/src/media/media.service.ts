import {Injectable} from '@nestjs/common';
import {HydratedDocument, Model} from "mongoose";
import {User} from "../users/user.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Media} from "./media.schema";

/**
 * Service for managing media resources.
 */
@Injectable()
export class MediaService {
    constructor(@InjectModel(Media.name) private mediaModel: Model<Media>) {
    }

    /**
     * Finds all media entries associated with a specific user, sorted by creation date in descending order.
     * @param user - The user whose media entries are to be retrieved.
     * @returns A promise resolving to an array of media documents.
     */
    async findAllForUser(user: HydratedDocument<User>) {
        return this.mediaModel.find({user: user._id}).sort({
            _id: -1
        }).exec();
    }

    /**
     * Creates a new media entry for a specific user.
     * @param user - The user who owns the media.
     * @param param - The media details including path, size, name, mimetype, and location.
     * @returns A promise resolving to the created media document.
     */
    async create(user: HydratedDocument<User>, param: {
        path: string;
        size: number;
        name: string;
        mimetype: string;
        location: string;
    }) {
        return this.mediaModel.create({
            ...param,
            user: user,
        })
    }

    /**
     * Finds a media entry by its ID.
     * @param id - The ID of the media entry to retrieve.
     * @returns A promise resolving to the media document, or null if not found.
     */
    async findById(id: string) {
        return this.mediaModel.findById(id).exec();
    }
}
