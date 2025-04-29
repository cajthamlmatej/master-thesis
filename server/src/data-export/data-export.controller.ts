import {Controller, Get, Header, NotFoundException, Param, Post, Req, StreamableFile, UseGuards} from '@nestjs/common';
import {RequiresAuthenticationGuard} from "../auth/auth.guard";
import {DataExportService} from "./data-export.service";
import {RequestWithUser} from "../types";
import {createReadStream} from "fs";
import OneDataExportSuccessDTO from "../../dto/data-export/OneDataExportSuccessDTO";

@Controller('user/:id/data-export')
export class DataExportController {
    constructor(
        private readonly dataExportService: DataExportService) {
    }

    @Get("/")
    @UseGuards(RequiresAuthenticationGuard)
    public async get(@Param('id') id: string, @Req() req: RequestWithUser) {
        const data = await this.dataExportService.get(req.user);

        if (!data) {
            throw new NotFoundException("No data export found");
        }

        return {
            dataExport: {
                id: data.id,
                expiresAt: data.expiresAt,
                completedAt: data.completedAt,
                requestedAt: data.requestedAt,
            }
        } as OneDataExportSuccessDTO;
    }

    @Post("/")
    @UseGuards(RequiresAuthenticationGuard)
    public async create(@Param('id') id: string, @Req() req: RequestWithUser) {
        const data = await this.dataExportService.get(req.user);

        if (data) {
            throw new NotFoundException("Data export already exists");
        }

        const newData = await this.dataExportService.create(req.user);

        return {
            success: true,
        };
    }

    @Get("/:exportId")
    @UseGuards(RequiresAuthenticationGuard)
    @Header('Cache-Control', 'public, max-age=31536000')
    public async getOne(@Param("id") id: string, @Param("exportId") exportId: string, @Req() req: RequestWithUser) {
        const data = await this.dataExportService.get(req.user);

        if (!data) {
            throw new NotFoundException("No data export found");
        }

        if (data.id !== exportId) {
            throw new NotFoundException("Data export not found");
        }

        if (!data.completedAt || !data.expiresAt) {
            throw new NotFoundException("Data export not completed");
        }

        if (data.expiresAt < new Date()) {
            throw new NotFoundException("Data export expired");
        }

        // DOWNLOAD FILE
        const path = this.dataExportService.getPath(data);

        const stream = createReadStream(path);

        return new StreamableFile(stream, {
            disposition: 'inline; filename="data-export.zip"; filename*=UTF-8\'\'data-export.zip\'\;',
        });
    }

}
