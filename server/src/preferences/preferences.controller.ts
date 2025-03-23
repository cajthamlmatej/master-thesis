import {Body, Controller, Get, HttpCode, Param, Patch, Req, UnauthorizedException, UseGuards} from '@nestjs/common';
import {PreferencesService} from "./preferences.service";
import {RequestWithUser} from "../types";
import {RequiresAuthenticationGuard} from "../auth/auth.guard";
import {OnePreferencesSuccessDTO} from "../../dto/preferences/OnePreferencesSuccessDTO";
import {UpdatePreferencesDTO} from "../../dto/preferences/UpdatePreferencesDTO";

@Controller('')
export class PreferencesController {

    constructor(private readonly preferencesService: PreferencesService) {
    }

    @Get("/user/:user/preferences")
    @UseGuards(RequiresAuthenticationGuard)
    async findForUser(@Param('user') user: string, @Req() req: RequestWithUser) {
        const authenticatedUser = req.user;

        let preferences = await this.preferencesService.findForUser(authenticatedUser);

        if (!preferences) {
            preferences = await this.preferencesService.create(authenticatedUser);
        }

        if (req.user.id !== user) throw new UnauthorizedException('You are not allowed to access this resource');

        return {
            preferences: {
                KEEP_EDITOR_TO_FIT_PARENT: preferences.KEEP_EDITOR_TO_FIT_PARENT,
                PER_OBJECT_TRANSFORMATION: preferences.PER_OBJECT_TRANSFORMATION,
                ROTATION_SNAPPING_COUNT: preferences.ROTATION_SNAPPING_COUNT,
                // AUTOMATIC_SAVING: preferences.AUTOMATIC_SAVING,
                // AUTOMATIC_SAVING_INTERVAL: preferences.AUTOMATIC_SAVING_INTERVAL,
                HISTORY_LIMIT: preferences.HISTORY_LIMIT,
            }
        } as OnePreferencesSuccessDTO;
    }

    @Patch('/user/:user/preferences')
    @UseGuards(RequiresAuthenticationGuard)
    @HttpCode(204)
    async update(@Param('user') user: string, @Body() updateDto: UpdatePreferencesDTO, @Req() req: RequestWithUser) {
        let preferences = await this.preferencesService.findForUser(req.user);

        if (!preferences) {
            preferences = await this.preferencesService.create(req.user);
        }

        if (req.user.id !== user) throw new UnauthorizedException('You are not allowed to access this resource');

        await this.preferencesService.update(preferences, updateDto);
    }

}
