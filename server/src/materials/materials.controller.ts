import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Req, StreamableFile,
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
import puppeteer from "puppeteer";
import * as fs from "fs";
import PDFMerger from "./../utils/pdfMerger.js";

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
                updatedAt: m.updatedAt,
                thumbnail: m.slides[0]?.thumbnail
            }))
        } as AllMaterialSuccessDTO;
    }

    @Get('/material/:id')
    @UseGuards(OptionalAuthenticationGuard)
    async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
        const material = await this.materialsService.findById(id);

        if (!material) throw new Error("Material not found");

        if (material.visibility === 'PRIVATE') {
            const user = req.user || {id: null};

            if (material.user.toString() !== user.id) throw new UnauthorizedException('You are not allowed to access this resource');
        }

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

        // TODO: validate if release & plugin exists

        await this.materialsService.update(material, updateMaterialDto);
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
                }))
            }
        } as CreateMaterialSuccessDTO;
    }

    @Delete('/material/:id')
    @UseGuards(RequiresAuthenticationGuard)
    @HttpCode(204)
    async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
        const material = await this.materialsService.findById(id);

        if (!material) throw new Error("Material not found");
        if (material.user.toString() !== req.user.id) throw new UnauthorizedException('You are not allowed to access this resource');

        await this.materialsService.remove(material);
    }

    @Get('/material/:id/export/:format')
    @UseGuards(RequiresAuthenticationGuard)
    async export(@Param('id') id: string, @Req() req: RequestWithUser, @Param('format') format: string) {
        const material = await this.materialsService.findById(id);

        if (!material) throw new Error("Material not found");
        if (material.user.toString() !== req.user.id) throw new UnauthorizedException('You are not allowed to access this resource');

        const materialId = material.id;
        const outputFolder = `./temp/${materialId}/`;

        fs.mkdirSync(outputFolder, { recursive: true });

        let suffix = '';
        if(format === 'pdf') {
            suffix = '.pdf';
        } else if(format === 'local') {
            suffix = '.json';
        } else {
            throw new Error("Invalid format");
        }

        let output = `${outputFolder}/output-${format}${suffix}`;

        if(format === 'pdf') {
            const browser = await puppeteer.launch();

            for (let slide of material.slides) {
                const slideId = slide.id;
                const outputFile = `${outputFolder}/${slideId}.pdf`;
                const data = JSON.parse(slide.data);
                const width = Number(data.editor.size.width);
                const height = Number(data.editor.size.height);

                const page = await browser.newPage();
                await page.setViewport({width: width, height: height});

                await page.goto(
                    `http://localhost:5173/cs/player/${materialId}?slide=${slideId}&rendering=true&cookies=true`, {waitUntil: 'networkidle2'});

                await page.pdf({
                    path: outputFile,
                    width: width,
                    height: height,
                    printBackground: true
                });
            }

            await browser.close();

            const merger = new PDFMerger();

            for (let slide of material.slides) {
                const slideId = slide.id;
                const outputFile = `${outputFolder}/${slideId}.pdf`;

                await merger.add(outputFile);
            }

            const updated = await material.populate("user");

            await merger.setMetadata({
                title: material.name,
                author: updated.user.name.toString(),
            });

            await merger.save(output);
        } else if(format === 'local') {
            fs.writeFileSync(output, JSON.stringify(material.slides.map(s => {
                return {
                    ...s,
                    thumbnail: undefined,
                }
            })));
        }

        const stream = fs.createReadStream(output);

        return new StreamableFile(stream, {
            disposition: 'inline; filename="' + material.name + '"; filename*=UTF-8\'\'' + encodeURIComponent(material.name) + '\'\;',
        });
    }
}
