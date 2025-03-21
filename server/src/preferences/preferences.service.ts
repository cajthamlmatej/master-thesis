import { Injectable } from '@nestjs/common';
import {HydratedDocument, Model} from "mongoose";
import {User} from "../users/user.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Preferences} from "./preferences.schema";
import {UpdatePreferencesDTO} from "../../dto/preferences/UpdatePreferencesDTO";

@Injectable()
export class PreferencesService {
    constructor(@InjectModel(Preferences.name) private preferencesModel: Model<Preferences>) {
    }

    async findForUser(user: HydratedDocument<User>) {
        return this.preferencesModel.findOne({user: user.id}).exec();
    }

    async create(user: HydratedDocument<User>) {
        const preferences = new this.preferencesModel({
            user: user,
            KEEP_EDITOR_TO_FIT_PARENT: true,
            PER_OBJECT_TRANSFORMATION: true,
            ROTATION_SNAPPING_COUNT: 24,
            // AUTOMATIC_SAVING: true,
            // AUTOMATIC_SAVING_INTERVAL: 60000,
            HISTORY_LIMIT: 100,
        });

        return preferences.save();
    }

    async update(preferences: HydratedDocument<Preferences>, changes: UpdatePreferencesDTO) {
        await this.preferencesModel.findByIdAndUpdate(preferences._id, {
            $set: {
                ...changes,
            }
        });
    }
}
