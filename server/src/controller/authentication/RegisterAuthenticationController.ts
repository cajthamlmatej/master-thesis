import * as express from 'express'
import Joi from "../../validation/joi";
import bcrypt from 'bcrypt';

import {Inject, Service} from 'typedi';

import UserRepository from '../../database/repository/UserRepository';

import Controller from '../Controller';
import {Errors} from '../../../lib/Errors';
import builder from '../../response/Builder';

import ValidateBody from '../../middleware/ValidateBody';
import RegisterAuthenticationDTO from "../../../lib/dto/request/authentication/RegisterAuthenticationDTO";
import generateToken from "../../utils/GenerateToken";
import EmailService from "../../email/EmailService";
import EmailTemplates from "../../email/EmailTemplates";


const schema = Joi.object({
    name: Joi.string().required().max(255),
    email: Joi.string().email().required().max(255),
    password: Joi.string().required().max(255),
});

@Service()
export default class RegisterAuthenticationController extends Controller {

    constructor(
        @Inject(() => UserRepository) private readonly userRepository: UserRepository,
        @Inject(() => EmailService) private readonly emailService: EmailService,
    ) {
        super();
    }

    async handle(req: express.Request, res: express.Response) {
        const validate = ValidateBody<RegisterAuthenticationDTO>(schema)(req, res);

        if (!validate) return; // Should be handled by ValidateBody.

        const {name, email, password} = validate;

        const user = await this.userRepository.getByEmail(email);

        // User already exists
        if (user) {
            return builder
                .error()
                .client()
                .setError(Errors.ENTITY_ALREADY_EXISTS)
                .send(res);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10);

        // Create user
        const newUser = await this.userRepository.create({
            name,
            email,
            password: hashedPassword,
        }, () => generateToken(128));

        if (!process.env.FRONTEND_DOMAIN_AUTHENTICATION_VALIDATE || !process.env.FRONTEND_DOMAIN) {
            console.error('FRONTEND_DOMAIN_AUTHENTICATION_VALIDATE or FRONTEND_DOMAIN is not set in .env file.');

            return builder
                .error()
                .server()
                .setError(Errors.SERVER_ERROR)
                .send(res);
        }

        // Send email
        await this.emailService.sendEmail(newUser.email, EmailTemplates.VERIFY_EMAIL, {
            name: newUser.name,
            link: `${process.env.FRONTEND_DOMAIN}${process.env.FRONTEND_DOMAIN_AUTHENTICATION_VALIDATE.replace('{{token}}', newUser.token as string)}`,
        });

        return builder
            .success()
            .send(res);
    }
}