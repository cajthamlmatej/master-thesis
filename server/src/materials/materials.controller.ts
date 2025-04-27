import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    forwardRef,
    Get,
    HttpCode,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    Req,
    StreamableFile,
    UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import {MaterialsService} from './materials.service';
import {RequestWithUser} from "../types";
import {OptionalAuthenticationGuard, RequiresAuthenticationGuard} from "../auth/auth.guard";
import {AllMaterialSuccessDTO} from "../../dto/material/AllMaterialSuccessDTO";
import {OneMaterialSuccessDTO} from "../../dto/material/OneMaterialSuccessDTO";
import {UpdateMaterialDTO} from "../../dto/material/UpdateMaterialDTO";
import {CreateMaterialDTO} from "../../dto/material/CreateMaterialDTO";
import {CreateMaterialSuccessDTO} from "../../dto/material/CreateMaterialSuccessDTO";
import {MaterialsExportService} from "./materialsExport.service";
import {EventsGateway} from "../events/events.gateway";
import {UsersService} from "../users/users.service";
import {HydratedDocument} from "mongoose";
import {User} from "../users/user.schema";
import FeaturedMaterialsSuccessDTO from "../../dto/material/FeaturedMaterialsSuccessDTO";
import { normalizeString } from '../utils/normalize';

@Controller('')
export class MaterialsController {
    constructor(
        private readonly materialsService: MaterialsService,
        private readonly materialsExportService: MaterialsExportService,
        private readonly userService: UsersService,
        @Inject(forwardRef(() => EventsGateway)) private readonly eventsGateway: EventsGateway,
    ) {
    }


    @Get("/material/featured")
    async featured(@Param('user') user: string, @Req() req: RequestWithUser) {
        const materials = await this.materialsService.getFeaturedMaterials();

        return {
            materials: materials.map((m) => ({
                id: m.id,
                name: m.name,
                user: m.user,
                thumbnail: m.thumbnail,
            }))
        } as FeaturedMaterialsSuccessDTO;
    }

    @Get("/user/:user/material")
    @UseGuards(RequiresAuthenticationGuard)
    async findAllForUser(@Param('user') user: string, @Req() req: RequestWithUser) {
        const authenticatedUser = req.user;

        if (req.user.id !== user) throw new UnauthorizedException('You are not allowed to access this resource');

        const materials = await this.materialsService.findAllForUser(authenticatedUser);

        return {
            materials: materials.map((m) => ({
                id: m.id,
                name: m.name,
                createdAt: m.createdAt,
                updatedAt: m.updatedAt,
                thumbnail: m.slides[0]?.thumbnail,
                user: m.user.toString(),
                featured: m.featured,
            }))
        } as AllMaterialSuccessDTO;
    }

    @Get('/material/:id')
    @UseGuards(OptionalAuthenticationGuard)
    async findOne(@Param('id') id: string, @Req() req: RequestWithUser, @Query('token') token: string | undefined) {
        let material = await this.materialsService.findById(id);

        if (!material) throw new BadRequestException("Material not found");

        if (material.visibility === 'PRIVATE') {
            const user = req.user || {id: null};

            if (!token) {
                if(!user || !user.id) {
                    throw new UnauthorizedException('You are not allowed to access this resource');
                }

                if (material.user.toString() !== user.id) {
                    if(!material.attendees.map(a => a.toString()).includes(user.id.toString())) {
                        throw new UnauthorizedException('You are not allowed to access this resource');
                    }
                }
            } else if (token !== this.materialsExportService.getToken()) {
                throw new UnauthorizedException('You are not allowed to access this resource');
            }
        }

        const editorRoom = this.eventsGateway.getEditorRoom(material.id);
        if (editorRoom !== undefined) {
            material = editorRoom.getMaterial();
        }


        const materialWithAttendees = await (await this.materialsService.findById(id))?.populate("attendees");

        if(!materialWithAttendees) throw new BadRequestException("Material not found");

        return {
            material: {
                id: material.id,
                name: material.name,
                plugins: material.plugins.map((plugin) => ({
                    plugin: plugin.plugin.toString(),
                    release: plugin.release
                })),
                visibility: material.visibility,
                method: material.method,
                automaticTime: material.automaticTime,
                sizing: material.sizing,
                createdAt: material.createdAt,
                updatedAt: material.updatedAt,
                user: material.user.toString(),
                slides: material.slides.map((slide) => ({
                    id: slide.id,
                    thumbnail: slide.thumbnail,
                    position: slide.position,
                    data: slide.data
                })),
                attendees: materialWithAttendees.attendees.map((attendee => ({
                    id: (attendee as any).id,
                    name: attendee.name,
                }))),
                featured: material.featured,
            }
        } as OneMaterialSuccessDTO;
    }

    @Patch('/material/:id')
    @UseGuards(RequiresAuthenticationGuard)
    @HttpCode(204)
    async update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDTO, @Req() req: RequestWithUser) {
        const material = await this.materialsService.findById(id);

        if (!material) throw new BadRequestException("Material not found");

        if (material.user.toString() !== req.user.id) {
            if(!material.attendees.map(a => a.toString()).includes(req.user.id.toString())) {
                throw new UnauthorizedException('You are not allowed to access this resource');
            }
        }
        // TODO: validate if release & plugin exists

        // Just the owner of the material can update the attendees
        if(material.user.toString() === req.user.id) {
            const attendees = updateMaterialDto.attendees || material.attendees;
            let newAttendees = [] as HydratedDocument<User>[];

            for (const attendee of attendees) {
                const isObjectId = attendee.toString().match(/^[0-9a-fA-F]{24}$/);

                if (isObjectId) {
                    const user = await this.userService.getById(attendee.toString());
                    if (user) {
                        newAttendees.push(user.id);
                    }
                } else {
                    const user = await this.userService.getByEmail(attendee.toString());
                    if (user) {
                        newAttendees.push(user.id);
                    }
                }
            }

            newAttendees = newAttendees.filter((attendee) => attendee.id !== req.user.id.toString());

            await this.materialsService.update(material, {...updateMaterialDto, attendees: newAttendees});
        } else {
            await this.materialsService.update(material, updateMaterialDto);
        }

        if(updateMaterialDto.featured !== undefined && (await this.materialsService.getFeaturedMaterials()).length < 20) {
            this.materialsService.updateFeatured();
        }
    }



    @Post('/material')
    @UseGuards(RequiresAuthenticationGuard)
    async create(@Body() createMaterialDto: CreateMaterialDTO, @Req() req: RequestWithUser) {
        const material = await this.materialsService.create(createMaterialDto, req.user);

        // TODO: validate if release & plugin exists

        return {
            material: {
                id: material.id,
                name: material.name,
                plugins: material.plugins.map((plugin) => ({
                    plugin: plugin.plugin.toString(),
                    release: plugin.release
                })),
                visibility: material.visibility,
                method: material.method,
                automaticTime: material.automaticTime,
                sizing: material.sizing,
                user: material.user.toString(),
                createdAt: material.createdAt,
                updatedAt: material.updatedAt,
                slides: material.slides.map((slide) => ({
                    id: slide.id,
                    thumbnail: slide.thumbnail,
                    position: slide.position,
                    data: slide.data
                })),
                featured: material.featured,
            }
        } as CreateMaterialSuccessDTO;
    }

    @Delete('/material/:id')
    @UseGuards(RequiresAuthenticationGuard)
    @HttpCode(204)
    async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
        const material = await this.materialsService.findById(id);

        if (!material) throw new BadRequestException("Material not found");
        // Only the owner of the material can delete it
        if (material.user.toString() !== req.user.id) throw new UnauthorizedException('You are not allowed to access this resource');

        await this.materialsService.remove(material);
    }

    @Get('/material/:id/export/:format')
    @UseGuards(RequiresAuthenticationGuard)
    async export(@Param('id') id: string, @Req() req: RequestWithUser, @Param('format') format: string) {
        let material = await this.materialsService.findById(id);

        if (!material) throw new BadRequestException("Material not found");

        const editorRoom = this.eventsGateway.getEditorRoom(material.id);
        if (editorRoom !== undefined) {
            material = editorRoom.getMaterial();
        }

        if (material.user.toString() !== req.user.id) {
            if(!material.attendees.map(a => a.toString()).includes(req.user.id.toString())) {
                throw new UnauthorizedException('You are not allowed to access this resource');
            }
        }

        try {
            const stream = await this.materialsExportService.exportMaterial(material, format);

            return new StreamableFile(stream, {
                disposition: 'inline; filename="' + normalizeString(material.name) + '"; filename*=UTF-8\'\'' + normalizeString(encodeURIComponent(material.name)) + '\'\;',
            });
        } catch (e) {
            console.log(e);
            throw new BadRequestException('Wrong format provided');
        }
    }
}
