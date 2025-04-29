import {Injectable} from '@nestjs/common';
import {HydratedDocument, Model} from "mongoose";
import {User} from "../users/user.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Media} from "./media.schema";

@Injectable()
export class MediaService {
    constructor(@InjectModel(Media.name) private mediaModel: Model<Media>) {
    }

    async findAllForUser(user: HydratedDocument<User>) {
        return this.mediaModel.find({user: user._id}).sort({
            _id: -1
        }).exec();
    }

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

    async findById(id: string) {
        return this.mediaModel.findById(id).exec();
    }
}
