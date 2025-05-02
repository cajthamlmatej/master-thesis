import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {HydratedDocument, Model} from "mongoose";
import {Plugin} from "./plugin.schema";
import {User} from "../users/user.schema";
import {CreatePluginReleaseDTO} from "../../dto/plugin/CreatePluginReleaseDTO";
import {CreatePluginDTO} from "../../dto/plugin/CreatePluginDTO";
import {UpdatePluginDTO} from "../../dto/plugin/UpdatePluginDTO";

/**
 * Service for managing plugins, including creation, updates, and retrieval.
 */
@Injectable()
export class PluginService {
    constructor(@InjectModel(Plugin.name) private pluginModel: Model<Plugin>) {
    }

    /**
     * Retrieves all plugins with their authors populated.
     * @returns A promise resolving to a list of plugins.
     */
    async getPlugins() {
        return this.pluginModel.find().populate("author").exec();
    }

    /**
     * Retrieves plugins by their IDs with their authors populated.
     * @param pluginIds - Array of plugin IDs to retrieve.
     * @returns A promise resolving to a list of plugins.
     */
    async getPluginsByIds(pluginIds: string[]) {
        return this.pluginModel.find({
            _id: {
                $in: pluginIds
            }
        }).populate("author").exec();
    }

    /**
     * Finds all plugins created by a specific user.
     * @param authenticatedUser - The user whose plugins are to be retrieved.
     * @returns A promise resolving to a list of plugins.
     */
    async findAllForUser(authenticatedUser: HydratedDocument<User>) {
        return this.pluginModel.find({
            author: authenticatedUser._id
        });
    }

    /**
     * Retrieves a plugin by its ID.
     * @param id - The ID of the plugin to retrieve.
     * @returns A promise resolving to the plugin document or null if not found.
     */
    async getPluginById(id: string) {
        return this.pluginModel.findById(id).exec();
    }

    /**
     * Creates a new release for an existing plugin.
     * @param plugin - The plugin document to update.
     * @param body - Data for the new release.
     */
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

    /**
     * Creates a new plugin.
     * @param body - Data for the new plugin.
     * @param user - The user creating the plugin.
     */
    async createPlugin(body: CreatePluginDTO, user: HydratedDocument<User>) {
        const plugin = new this.pluginModel({
            name: body.name,
            icon: body.icon,
            description: body.description,
            tags: body.tags,
            author: user._id,
            releases: []
        });

        await plugin.save();
    }

    /**
     * Updates an existing plugin with new data.
     * @param plugin - The plugin document to update.
     * @param body - Data to update the plugin with.
     */
    async update(plugin: HydratedDocument<Plugin>, body: UpdatePluginDTO) {
        await this.pluginModel.findByIdAndUpdate(plugin._id, {
            $set: {
                ...body,
                updatedAt: new Date()
            }
        }).exec();
    }

    /**
     * Retrieves all plugins created by a specific user.
     * @param user - The user whose plugins are to be retrieved.
     * @returns A promise resolving to a list of plugins.
     */
    async getAllForUser(user: HydratedDocument<User>) {
        return this.pluginModel.find({
            author: user
        });
    }
}
