import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {UsersService} from "../users/users.service";
import {ConfigService} from "@nestjs/config";
import {WsException} from "@nestjs/websockets";

/**
 * Guard that ensures the user is authenticated by verifying the provided JWT token.
 * Throws an UnauthorizedException if the token is invalid or missing.
 */
@Injectable()
export class RequiresAuthenticationGuard implements CanActivate {
    constructor(
        readonly usersService: UsersService,
        readonly configService: ConfigService
    ) {
    }

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

/**
 * Guard that optionally authenticates the user.
 * If no token is provided, the request proceeds without authentication.
 * If a token is provided, it is validated, and the user is attached to the request.
 */
@Injectable()
export class OptionalAuthenticationGuard implements CanActivate {
    constructor(readonly usersService: UsersService,
                readonly configService: ConfigService) {
    }

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

/**
 * WebSocket guard that optionally authenticates the user.
 * If no token is provided in the WebSocket handshake, the connection proceeds without authentication.
 * If a token is provided, it is validated, and the user is attached to the WebSocket client data.
 */
@Injectable()
export class WSOptionalAuthenticationGuard implements CanActivate {

    constructor(readonly usersService: UsersService,
                readonly configService: ConfigService) {
    }

    async canActivate(
        context: ExecutionContext,
    ) {
        const request = context.switchToWs().getClient();

        const authorizationHeader = request.handshake.auth.Authorization;

        if (!authorizationHeader) return true;

        const [bearer, token] = authorizationHeader.split(' ');

        if (bearer !== 'Bearer' || !token) throw new WsException('Invalid authorization header');

        request.token = token;

        try {
            const decoded = jwt.verify(token, this.configService.get<string>("JWT_SECRET")!.toString()) as any;

            if (!decoded) throw new WsException('Invalid token');

            if (!('id' in decoded)) throw new WsException('Invalid token');

            const user = await this.usersService.getById(decoded.id);

            if (!user) throw new WsException('Invalid token');

            request.data.user = user;
        } catch (e) {
            throw new WsException('Invalid token');
        }
        return true;
    }
}