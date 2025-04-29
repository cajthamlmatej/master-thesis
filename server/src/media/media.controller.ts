import {
    BadRequestException,
    Controller,
    FileTypeValidator,
    Get,
    Header,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    Req,
    StreamableFile,
    UnauthorizedException,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {RequiresAuthenticationGuard} from "../auth/auth.guard";
import {RequestWithUser} from "../types";
import {MediaService} from "./media.service";
import {createReadStream} from 'fs';
import {FileFastifyInterceptor} from 'fastify-file-interceptor';
import {CreateMediaSuccessDTO} from "../../dto/media/CreateMediaSuccessDTO";
import {AllMediaSuccessDTO} from "../../dto/media/AllMediaSuccessDTO";

@Controller('')
export class MediaController {
    constructor(private readonly mediaService: MediaService) {
    }

    @Get("/user/:user/media")
    @UseGuards(RequiresAuthenticationGuard)
    async findAllForUser(@Param('user') user: string, @Req() req: RequestWithUser) {
        const authenticatedUser = req.user;

        if (req.user.id !== user) throw new UnauthorizedException('You are not allowed to access this resource');

        const media = await this.mediaService.findAllForUser(authenticatedUser);

        return {
            media: media.map((m) => ({
                id: m.id,
                name: m.name,
                mimetype: m.mimetype,
                size: m.size
            }))
        } as AllMediaSuccessDTO;
    }

    @Post('/media')
    @UseGuards(RequiresAuthenticationGuard)
    @UseInterceptors(
        FileFastifyInterceptor("file")
    )
    async create(@Req() req: RequestWithUser, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({maxSize: 10000000}),
            new FileTypeValidator({fileType: /image\/.*/})
        ]
    })) file: Express.Multer.File) {
        const user = req.user;

        const media = await this.mediaService.create(
            user,
            {
                name: file.originalname,
                mimetype: file.mimetype,
                size: file.size ?? -1,
                location: 'LOCAL',
                path: file.path ?? ''
            }
        );

        return {
            media: {
                id: media.id,
                name: media.name,
                mimetype: media.mimetype,
                size: media.size
            }
        } as CreateMediaSuccessDTO;
    }

    @Get('/media/:id')
    @Header('Cache-Control', 'public, max-age=31536000')
    // @UseGuards(RequiresAuthenticationGuard)
    async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
        const material = await this.mediaService.findById(id);

        if (!material) throw new BadRequestException("Material not found");

        if (material.location !== 'LOCAL') throw new BadRequestException("Cannot access non-local files");

        const path = material.path;

        // Stream the file to the client
        const stream = createReadStream(path);

        return new StreamableFile(stream, {
            disposition: 'inline; filename="' + material.name + '"; filename*=UTF-8\'\'' + encodeURIComponent(material.name) + '\'\;',
        });
    }
}