import {CanActivate, ExecutionContext, Injectable, mixin, Type, UnauthorizedException} from '@nestjs/common';
import {Observable} from 'rxjs';
import * as jwt from 'jsonwebtoken';
import {UsersService} from "../users/users.service";
import {Expression} from "mongoose";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class RequiresAuthenticationGuard implements CanActivate {
    constructor(
        readonly usersService: UsersService,
        readonly configService: ConfigService
    ) { }

    public async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const authorizationHeader = request.headers.authorization;

        if (!authorizationHeader) throw new UnauthorizedException('Authorization header is missing');

        const [bearer, token] = authorizationHeader.split(' ');

        if (bearer !== 'Bearer' || !token) throw new UnauthorizedException('Invalid authorization header');

        request.token = token;

        try {
            const decoded = jwt.verify(token, this.configService.get<string>("JWT_SECRET")!.toString()) as any;

            if(!decoded) throw new UnauthorizedException('Invalid token');

            if(!('id' in decoded)) throw new UnauthorizedException('Invalid token');

            const user = await this.usersService.getById(decoded.id);

            if(!user) throw new UnauthorizedException('Invalid token');

            request.user = user;
        } catch (e) {
            throw new UnauthorizedException('Invalid token');
        }

        return true;
    }
}

@Injectable()
export class OptionalAuthenticationGuard implements CanActivate {
    constructor(readonly usersService: UsersService,
                readonly configService: ConfigService) { }

    async canActivate(
        context: ExecutionContext,
    ) {
        const request = context.switchToHttp().getRequest();

        const authorizationHeader = request.headers.authorization;

        if (!authorizationHeader) return true;

        const [bearer, token] = authorizationHeader.split(' ');

        if (bearer !== 'Bearer' || !token) throw new UnauthorizedException('Invalid authorization header');

        request.token = token;

        try {
            const decoded = jwt.verify(token, this.configService.get<string>("JWT_SECRET")!.toString()) as any;

            if (!decoded) throw new UnauthorizedException('Invalid token');

            if (!('id' in decoded)) throw new UnauthorizedException('Invalid token');

            const user = await this.usersService.getById(decoded.id);

            if (!user) throw new UnauthorizedException('Invalid token');

            request.user = user;
        } catch (e) {
            throw new UnauthorizedException('Invalid token');
        }

        return true;
    }

}