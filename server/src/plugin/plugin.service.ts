import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Plugin} from "./plugin.schema";

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
}
