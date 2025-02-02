import {BadRequestException, Body, Controller, Get, HttpCode, Post, Req, UseGuards} from '@nestjs/common';
import InAuthDTO from "../../dto/authentication/InAuthenticationDTO";
import {UsersService} from "../users/users.service";
import {User} from "../users/user.schema";
import {EmailService} from "../email/email.service";
import {AuthService} from "./auth.service";
import {ConfigService} from "@nestjs/config";
import {EmailTemplates} from "../email/email.template";
import RegisterAuthenticationDTO from "../../dto/authentication/RegisterAuthenticationDTO";
import ActivateAuthenticationDTO from "../../dto/authentication/ActivateAuthenticationDTO";
import AuthenticationSuccessDTO from "../../dto/authentication/AuthenticationSuccessDTO";

@Controller('authentication')
export class AuthController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService
    ) {
    }

    @Post('/in')
    @HttpCode(200)
    public async in(@Body() dto: InAuthDTO) {
        const user = await this.usersService.getByEmail(dto.email);

        if (!user) throw new BadRequestException('User does not exist.');
        if (!user.active) throw new BadRequestException('User is not activated and cannot authenticate yet.');

        switch (dto.type) {
            case 'EMAIL': {
                const code = dto.code;

                if (!code) {
                    const hasRequest = await this.authService.hasUserValidRequest(user);

                    if(hasRequest) throw new BadRequestException('User already has a valid request for email authentication.');

                    const request = await this.authService.createRequest(user);
                    const code = request.code;

                    await this.emailService.sendEmail(user.email, EmailTemplates.AUTHENTICATION_REQUEST, {
                        code: code,
                        name: user.name,
                        link: this.configService.get<string>("FRONTEND_DOMAIN")! + this.configService.get<string>("FRONTEND_DOMAIN_AUTHENTICATION")!
                    });
                    return;
                }

                const authenticationRequest = await this.authService.getValidByCode(code);

                if(!authenticationRequest) throw new BadRequestException('Invalid code.');

                if(authenticationRequest.user.toString() !== user._id.toString()) throw new BadRequestException('Invalid code.');

                const token = await this.usersService.generateToken(user);

                await this.authService.markRequestAsUsed(authenticationRequest);

                return {
                    token: token
                } as AuthenticationSuccessDTO;
            }
            case 'EMAIL_PASSWORD': {
                const password = dto.password;

                if (!password)
                    throw new BadRequestException('Password is required when using EMAIL_PASSWORD authentication type.');

                const valid = await this.usersService.comparePassword(user, password);

                if (!valid)
                    throw new BadRequestException('Invalid password.');

                const token = await this.usersService.generateToken(user);

                return {
                    token: token
                } as AuthenticationSuccessDTO;
            }
        }

        throw new BadRequestException('Invalid authentication type.');
    }

    @Post('/register')
    @HttpCode(200)
    public async register(@Body() dto: RegisterAuthenticationDTO) {
        const userByEmail = await this.usersService.getByEmail(dto.email);

        if (userByEmail) throw new BadRequestException('User already exists.');

        const hashedPassword = await this.usersService.hashPassword(dto.password);

        const user = await this.usersService.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword
        });

        await this.emailService.sendEmail(user.email, EmailTemplates.VERIFY_EMAIL, {
            name: user.name,
            link: this.configService.get<string>("FRONTEND_DOMAIN") + this.configService.get<string>("FRONTEND_DOMAIN_AUTHENTICATION_VALIDATE")!.replace('{{token}}', user.token as string)
        });
    }

    @Post('/activate')
    @HttpCode(200)
    public async activate(@Body() dto: ActivateAuthenticationDTO) {
        const byToken = await this.usersService.getByVerifyToken(dto.token);

        if (!byToken) throw new BadRequestException('Invalid token.');

        if(byToken.active) throw new BadRequestException('User is already activated.');

        await this.usersService.activate(byToken);
    }

}
