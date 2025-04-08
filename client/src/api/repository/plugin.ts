import {Repository} from "../repository";
import {AllPluginsSuccessDTO} from "../../../lib/dto/plugin/AllPluginsSuccessDTO";
import {SpecificPluginsSuccessDTO} from "../../../lib/dto/plugin/SpecificPluginsSuccessDTO";
import {CreatePluginReleaseDTO} from "../../../lib/dto/plugin/CreatePluginReleaseDTO";
import {CreatePluginDTO} from "../../../lib/dto/plugin/CreatePluginDTO";
import {UpdatePluginDTO} from "../../../lib/dto/plugin/UpdatePluginDTO";

export class PluginRepository extends Repository {

    async all() {
        return await this.makeRequest<AllPluginsSuccessDTO>(
            `plugin`,
            "GET"
        );
    }

    async specific(strings: string[] | string) {
        const ids = Array.isArray(strings) ? strings.join(",") : strings;

        return await this.makeRequest<SpecificPluginsSuccessDTO>(
            `plugin/${ids}`,
            "GET"
        );
    }

    async forUser(user: string) {
        return await this.makeRequest<AllPluginsSuccessDTO>(
            `user/${user}/plugin`,
            "GET"
        );
    }

    async createRelease(id: string, release: CreatePluginReleaseDTO) {
        return await this.makeRequest(
            `plugin/${id}/release`,
            "POST",
            release
        );
    }

    async create(data:CreatePluginDTO) {
        return await this.makeRequest(
            `plugin`,
            "POST",
            data
        );
    }

    async update(id: string, data: UpdatePluginDTO) {
        return await this.makeRequest(
            `plugin/${id}`,
            "PATCH",
            data
        );
    }
}
