import {Injectable} from '@nestjs/common';
import {HydratedDocument, Model} from "mongoose";
import {User} from "../users/user.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Preferences} from "./preferences.schema";
import {UpdatePreferencesDTO} from "../../dto/preferences/UpdatePreferencesDTO";

/**
 * Service responsible for managing user preferences.
 */
@Injectable()
export class PreferencesService {
    constructor(@InjectModel(Preferences.name) private preferencesModel: Model<Preferences>) {
    }

    /**
     * Finds the preferences for a given user.
     * @param user - The user whose preferences are to be retrieved.
     * @returns A promise resolving to the user's preferences document.
     */
    async findForUser(user: HydratedDocument<User>) {
        return this.preferencesModel.findOne({user: user.id}).exec();
    }

    /**
     * Creates a new preferences document for a given user with default values.
     * @param user - The user for whom the preferences are to be created.
     * @returns A promise resolving to the newly created preferences document.
     */
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

    /**
     * Updates an existing preferences document with the provided changes.
     * @param preferences - The preferences document to be updated.
     * @param changes - An object containing the changes to be applied.
     * @returns A promise resolving when the update operation is complete.
     */
    async update(preferences: HydratedDocument<Preferences>, changes: UpdatePreferencesDTO) {
        await this.preferencesModel.findByIdAndUpdate(preferences._id, {
            $set: {
                ...changes,
            }
        });
    }
}
