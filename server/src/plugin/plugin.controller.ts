import {Controller, Get, Param, Req} from '@nestjs/common';
import {PreferencesService} from "../preferences/preferences.service";
import {PluginService} from "./plugin.service";
import {RequestWithUser} from "../types";
import {AllPluginsSuccessDTO} from "../../dto/plugin/AllPluginsSuccessDTO";
import {SpecificPluginsSuccessDTO} from "../../dto/plugin/SpecificPluginsSuccessDTO";

@Controller('plugin')
export class PluginController {
    constructor(private readonly pluginService: PluginService) {
    }

    @Get('/')
    public async getPlugins(@Req() req: RequestWithUser) {
        const plugins = await this.pluginService.getPlugins();

        return {
            plugins: plugins.map((p) => ({
                id: p.id,
                author: p.author ? p.author.name : "Unknown",
                name: p.name,
                icon: p.icon,
                description: p.description,
                tags: p.tags
            }))
        } as AllPluginsSuccessDTO;
    }

    @Get('/:ids')
    public async getPlugin(@Param('ids') ids: string) {
        const pluginIds = ids.split(",");

        const plugins = await this.pluginService.getPluginsByIds(pluginIds);

        return {
            plugins: plugins.map((p) => ({
                id: p.id,
                author: p.author ? p.author.name : "Unknown",
                name: p.name,
                icon: p.icon,
                description: p.description,
                tags: p.tags,
                releases: p.releases.map((r) => ({
                    version: r.version,
                    date: r.date.toISOString(),
                    changelog: r.changelog,
                    manifest: r.manifest,
                    editorCode: r.editorCode,
                    playerCode: r.playerCode
                }))
            }))
        } as SpecificPluginsSuccessDTO;
    }
}
