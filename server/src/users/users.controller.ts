import {Controller, Get, NotFoundException, Param, Req, UnauthorizedException, UseGuards} from '@nestjs/common';
import {RequiresAuthenticationGuard} from "../auth/auth.guard";
import {RequestWithUser} from "../types";
import {UsersService} from "./users.service";
import OneUserSuccessDTO from "../../dto/user/OneUserSuccessDTO";

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

}
