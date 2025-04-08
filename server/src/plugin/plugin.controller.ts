import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Req,
    UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import {PluginService} from "./plugin.service";
import {RequestWithUser} from "../types";
import {AllPluginsSuccessDTO} from "../../dto/plugin/AllPluginsSuccessDTO";
import {SpecificPluginsSuccessDTO} from "../../dto/plugin/SpecificPluginsSuccessDTO";
import {RequiresAuthenticationGuard} from "../auth/auth.guard";
import {CreatePluginReleaseDTO} from "../../dto/plugin/CreatePluginReleaseDTO";
import {CreatePluginDTO} from "../../dto/plugin/CreatePluginDTO";
import {UpdatePluginDTO} from "../../dto/plugin/UpdatePluginDTO";

@Controller('')
export class PluginController {
    constructor(private readonly pluginService: PluginService) {
    }

    @Get('/plugin')
    public async getPlugins(@Req() req: RequestWithUser) {
        const plugins = await this.pluginService.getPlugins();

        return {
            plugins: plugins.map((p) => ({
                id: p.id,
                author: p.author ? p.author.name : "Unknown",
                name: p.name,
                icon: p.icon,
                description: p.description,
                tags: p.tags,
                lastReleaseDate: p.releases[0]?.date.toISOString(),
                lastManifest: p.releases[0]?.manifest
            }))
        } as AllPluginsSuccessDTO;
    }

    @Post('/plugin/')
    @UseGuards(RequiresAuthenticationGuard)
    public async createPlugin(@Body() body: CreatePluginDTO, @Req() req: RequestWithUser) {
        await this.pluginService.createPlugin(body, req.user);

        return {
            success: true
        }
    }

    @Patch('/plugin/:id')
    @UseGuards(RequiresAuthenticationGuard)
    @HttpCode(204)
    public async updatePlugin(@Param('id') id: string, @Body() body: UpdatePluginDTO, @Req() req: RequestWithUser) {
        const plugin = await this.pluginService.getPluginById(id);

        if (!plugin) {
            throw new UnauthorizedException('Plugin not found');
        }

        if (plugin.author.toString() !== req.user.id.toString()) {
            throw new UnauthorizedException('You are not allowed to access this resource');
        }

        await this.pluginService.update(plugin, body);

        return {
            success: true
        }
    }

    @Get("/user/:user/plugin")
    @UseGuards(RequiresAuthenticationGuard)
    public async findAllForUser(@Param('user') user: string, @Req() req: RequestWithUser) {
        const authenticatedUser = req.user;

        if (req.user.id !== user) throw new UnauthorizedException('You are not allowed to access this resource');

        const plugins = await this.pluginService.findAllForUser(authenticatedUser);

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
        } as AllPluginsSuccessDTO;
    }

    @Get('/plugin/:ids')
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

    @Post('/plugin/:id/release')
    @UseGuards(RequiresAuthenticationGuard)
    public async createPluginRelease(@Param('id') id: string, @Body() body: CreatePluginReleaseDTO, @Req() req: RequestWithUser) {
        const plugin = await this.pluginService.getPluginById(id);

        if (!plugin) {
            throw new UnauthorizedException('Plugin not found');
        }

        if (plugin.author.toString() !== req.user.id.toString()) {
            throw new UnauthorizedException('You are not allowed to access this resource');
        }

        await this.pluginService.createPluginRelease(plugin, body);

        return {
            success: true
        }
    }
}
