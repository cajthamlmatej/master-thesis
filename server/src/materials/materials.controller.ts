import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Req,
    UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import {MaterialsService} from './materials.service';
import {RequestWithUser} from "../types";
import {RequiresAuthenticationGuard} from "../auth/auth.guard";
import {AllMaterialSuccessDTO} from "../../dto/material/AllMaterialSuccessDTO";
import {OneMaterialSuccessDTO} from "../../dto/material/OneMaterialSuccessDTO";
import {UpdateMaterialDTO} from "../../dto/material/UpdateMaterialDTO";
import {CreateMaterialDTO} from "../../dto/material/CreateMaterialDTO";
import {CreateMaterialSuccessDTO} from "../../dto/material/CreateMaterialSuccessDTO";

@Controller('')
export class MaterialsController {
    constructor(private readonly materialsService: MaterialsService) {
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
                slides: m.slides.map((slide) => ({
                    id: slide.id,
                    thumbnail: slide.thumbnail,
                    position: slide.position,
                    data: slide.data
                }))
            }))
        } as AllMaterialSuccessDTO;
    }

    @Get('/material/:id')
    async findOne(@Param('id') id: string) {
        const material = await this.materialsService.findById(id);

        if(!material) throw new Error("Material not found");

        // TODO: can he access this material?

        return {
            material: {
                id: material.id,
                name: material.name,
                createdAt: material.createdAt,
                slides: material.slides.map((slide) => ({
                    id: slide.id,
                    thumbnail: slide.thumbnail,
                    position: slide.position,
                    data: slide.data
                }))
            }
        } as OneMaterialSuccessDTO;
    }

    @Patch('/material/:id')
    @UseGuards(RequiresAuthenticationGuard)
    @HttpCode(204)
    async update(@Param('id') id: string, @Body() updateMaterialDto: UpdateMaterialDTO, @Req() req: RequestWithUser) {
        const material = await this.materialsService.findById(id);

        if (!material) throw new Error("Material not found");
        if (material.user.toString() !== req.user.id) throw new UnauthorizedException('You are not allowed to access this resource');

        await this.materialsService.update(material, updateMaterialDto);
    }


    @Post('/material')
    @UseGuards(RequiresAuthenticationGuard)
    async create(@Body() createMaterialDto: CreateMaterialDTO, @Req() req: RequestWithUser) {
        const material = await this.materialsService.create({
            user: req.user,
            ...createMaterialDto
        });

        return {
            material: {
                id: material.id,
                name: material.name,
                createdAt: material.createdAt,
                slides: material.slides.map((slide) => ({
                    id: slide.id,
                    thumbnail: slide.thumbnail,
                    position: slide.position,
                    data: slide.data
                }))
            }
        } as CreateMaterialSuccessDTO;
    }
}
