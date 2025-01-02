import * as express from 'express'
import builder from '../../response/Builder';
import Joi from "../../validation/joi";
import ValidateBody from '../../middleware/ValidateBody';
import {Inject, Service} from 'typedi';

import Controller from '../Controller';
import UserRepository from "../../database/repository/UserRepository";
import {Errors} from "../../../lib/Errors";
import UpdateUserSelfDTO from "../../../lib/dto/request/user/UpdateUserSelfDTO";
import bcrypt from "bcrypt";
import EmailService from "../../email/EmailService";
import EmailTemplates from "../../email/EmailTemplates";

const schema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    active: Joi.boolean()
});
const schemaSelf = Joi.object({
    password: Joi.string().required().max(255).min(8)
});

@Service()
export default class UpdateUserController extends Controller {

    constructor(
        @Inject(() => UserRepository) private userRepository: UserRepository,
        @Inject(() => EmailService) private readonly emailService: EmailService,
    ) {
        super();
    }

    public async handle(req: express.Request, res: express.Response) {
        const user = req.user;
        const targetUser = req.params.user;

        // Should be handled by middlewares.
        if (!user) return;
        if (!targetUser) return;

        if (targetUser !== user.id) {
            return builder
                .error()
                .client()
                .setError(Errors.NOT_ALLOWED)
                .send(res);
        }

        // User is updating himself.

        // If not changed last 24 hours, allow
        if (user.lastPasswordChange && user.lastPasswordChange.getTime() > Date.now() - 24 * 60 * 60 * 1000) {
            return builder
                .error()
                .client()
                .setError(Errors.AUTHORIZATION_NOT_ALLOWED)
                .setData('Account password was changed less than 24 hours ago.')
                .setCode(403)
                .send(res);
        }

        // Allow changing password.
        const validate = ValidateBody<UpdateUserSelfDTO>(schemaSelf)(req, res);

        if (!validate) return; // Should be handled by ValidateBody.

        const {password} = validate;

        // Update user
        await this.userRepository.update(user.id, {
            password: bcrypt.hashSync(password, process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10),
            lastPasswordChange: new Date()
        });

        await this.emailService.sendEmail(user.email, EmailTemplates.PASSWORD_CHANGED, {
            name: user.name
        });

        return builder
            .success()
            .send(res);
    }
}