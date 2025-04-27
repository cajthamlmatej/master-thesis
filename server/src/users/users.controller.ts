import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Patch,
    Req,
    UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import {RequiresAuthenticationGuard} from "../auth/auth.guard";
import {RequestWithUser} from "../types";
import {UsersService} from "./users.service";
import OneUserSuccessDTO from "../../dto/user/OneUserSuccessDTO";
import UpdateUserDTO from "../../dto/user/UpdateUserDTO";

@Controller('user')
export class UsersController {
    constructor(
        private readonly usersService: UsersService) {
    }

    @Get("/:id")
    @UseGuards(RequiresAuthenticationGuard)
    public async getOne(@Param("id") id: string, @Req() req: RequestWithUser) {
        const authenticatedUser = req.user;

        if (authenticatedUser.id !== id) throw new UnauthorizedException('You are not allowed to access this resource');

        const target = await this.usersService.getById(id);

        if (!target) throw new NotFoundException('User does not exist');

        return {
            user: {
                id: target.id,
                name: target.name,
                email: target.email,
                active: target.active
            }
        } as OneUserSuccessDTO;
    }


    @Patch("/:id")
    @UseGuards(RequiresAuthenticationGuard)
    public async updateOne(@Param("id") id: string, @Req() req: RequestWithUser, @Body() update: UpdateUserDTO) {
        const authenticatedUser = req.user;

        if (authenticatedUser.id !== id) throw new UnauthorizedException('You are not allowed to access this resource');

        const target = await this.usersService.getById(id);

        if (!target) throw new NotFoundException('User does not exist');

        const validPassword = await this.usersService.comparePassword(target, update.currentPassword);

        if (!validPassword) throw new UnauthorizedException('Invalid password');

        await this.usersService.updateUser(id, {
            password: update.password ? (await this.usersService.hashPassword(update.password)) : undefined,
            name: update.name,
        });

        return {
            success: true,
        };
    }

    //
    // @Delete("/:id")
    // @UseGuards(OptionalAuthenticationGuard)
    // public async deleteOne(@Param("id") id: string, @Req() req: RequestWithUser) {
    //     if(req.user) {
    //         // Requesting
    //     } else {
    //         // Confirming
    //
    //         const ver
    //     }
    // }
}
