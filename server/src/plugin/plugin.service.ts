import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {HydratedDocument, Model} from "mongoose";
import {Plugin} from "./plugin.schema";
import {User} from "../users/user.schema";
import {CreatePluginReleaseDTO} from "../../dto/plugin/CreatePluginReleaseDTO";

@Injectable()
export class PluginService {
    constructor(@InjectModel(Plugin.name) private pluginModel: Model<Plugin>) {
    }

    async getPlugins() {
        return this.pluginModel.find().exec();
    }

    async getPluginsByIds(pluginIds: string[]) {
        return this.pluginModel.find({
            _id: {
                $in: pluginIds
            }
        }).exec();
    }

    async findAllForUser(authenticatedUser: HydratedDocument<User>) {
        return this.pluginModel.find({
            author: authenticatedUser._id
        });
    }

    async getPluginById(id: string) {
        return this.pluginModel.findById(id).exec();
    }

    async createPluginRelease(plugin: HydratedDocument<Plugin>, body: CreatePluginReleaseDTO) {
        plugin.releases.push({
            version: body.version,
            date: new Date(),
            changelog: body.changelog,
            manifest: body.manifest,
            editorCode: body.editorCode,
            playerCode: body.playerCode
        });

        await plugin.save();
    }
}
