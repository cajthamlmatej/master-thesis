import * as express from 'express'
import Joi from "../../validation/joi";
import bcrypt from 'bcrypt';
import moment from 'moment';

import {Inject, Service} from 'typedi';
import UserRepository from '../../database/repository/UserRepository';
import AuthenticationRequestRepository from '../../database/repository/AuthenticationRequestRepository';

import Controller from '../Controller';
import {Errors} from '../../../lib/Errors';
import builder from '../../response/Builder';

import InAuthDTO from '../../../lib/dto/request/authentication/InAuthenticationDTO';
import AuthenticationSuccessDTO from '../../../lib/dto/response/authentication/AuthenticationSuccessDTO';

import ValidateBody from '../../middleware/ValidateBody';
import generateToken from "../../utils/GenerateToken";
import EmailService from "../../email/EmailService";
import EmailTemplates from "../../email/EmailTemplates";
import {firstUppercase} from "../../utils/String";

const schema = Joi.object({
    type: Joi.string().allow('EMAIL', 'EMAIL_PASSWORD').required(),

    email: Joi.string().email(),
    password: Joi.string().when('type', {
        is: Joi.string().valid('EMAIL_PASSWORD'),
        then: Joi.required(),
        otherwise: Joi.disallow(Joi.any())
    }),

    code: Joi.string().when('type', {
        is: Joi.string().valid('EMAIL'),
        then: Joi.optional(),
        otherwise: Joi.disallow(Joi.any())
    })
});

@Service()
export default class InAuthenticationController extends Controller {

    constructor(
        @Inject(() => UserRepository) private readonly userRepository: UserRepository,
        @Inject(() => AuthenticationRequestRepository) private readonly authenticationRequestRepository: AuthenticationRequestRepository,
        @Inject(() => EmailService) private readonly emailService: EmailService,
    ) {
        super();
    }

    async handle(req: express.Request, res: express.Response) {
        const validate = ValidateBody<InAuthDTO>(schema)(req, res);

        if (!validate) return; // Should be handled by ValidateBody.

        const {type, email, code, password} = validate;

        const user = await this.userRepository.getByEmail(email);

        // User does not exist
        if (!user) {
            return builder
                .error()
                .client()
                .setCode(404)
                .setError(Errors.ENTITY_NOT_EXISTS)
                .send(res);
        }

        // User is not active
        if (!user.active) {
            return builder
                .error()
                .client()
                .setCode(403)
                .setError(Errors.AUTHENTICATION_NOT_ACTIVE)
                .send(res);
        }

        // If user want to log in with email.
        if (type === 'EMAIL') {
            if (code) {
                // Email should already be sent, so we expect a valid code

                // Does AuthenticationRequest exist for this user that is not used and has not expired?
                const authenticationRequest = await
                    this.authenticationRequestRepository
                        .getValidForUser(user); // TODO: fix if has many

                // Does AuthenticationRequest exist?
                if (!authenticationRequest) {
                    return builder
                        .error()
                        .client()
                        .setError(Errors.ENTITY_NOT_EXISTS)
                        .send(res);
                }

                // Is the code valid?
                if (authenticationRequest.code !== code) {
                    return builder
                        .error()
                        .client()
                        .setCode(403)
                        .setError(Errors.AUTHENTICATION_CODE_INVALID)
                        .send(res);
                }

                // Mark AuthenticationRequest as used.
                await this.authenticationRequestRepository.markAsUsed(authenticationRequest);

                const response = {
                    token: user.generateToken("90d")
                } as AuthenticationSuccessDTO;

                // Send token.
                return builder
                    .success()
                    .setData(response)
                    .send(res);
            } else {
                // Code is missing, so we send a new one.

                // Does AuthenticationRequest exist for this user that is not used and has not expired?
                const authenticationRequest = await this.authenticationRequestRepository.getValidForUser(user);

                // Does AuthenticationRequest exist?
                if (authenticationRequest) {
                    return builder
                        .error()
                        .client()
                        .setCode(403)
                        .setError(Errors.AUTHENTICATION_CODE_ALREADY_SENT)
                        .send(res);
                }

                // Generate code.
                const generateCode = () => generateToken(6, '0123456789').padStart(6, '0');

                let code;

                do {
                    code = generateCode();
                } while (await this.authenticationRequestRepository.existsValidByCode(code));

                // Create new AuthenticationRequest.
                await this.authenticationRequestRepository.create(user, code, moment().add(5, 'minutes').toDate());

                if (process.env.FRONTEND_DOMAIN === undefined || process.env.FRONTEND_DOMAIN_AUTHENTICATION === undefined) {
                    console.error('FRONTEND_DOMAIN or FRONTEND_DOMAIN_AUTHENTICATION is not defined.');
                    return builder
                        .error()
                        .server()
                        .setError(Errors.SERVER_ERROR)
                        .send(res);
                }

                // Send email.
                await this.emailService.sendEmail(user.email, EmailTemplates.AUTHENTICATION_REQUEST, {
                    code: code,
                    name: user.name,
                    link: process.env.FRONTEND_DOMAIN + process.env.FRONTEND_DOMAIN_AUTHENTICATION
                })

                return builder
                    .success()
                    .send(res);
            }
        } else if (type === 'EMAIL_PASSWORD') {
            // Does password match?
            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return builder
                    .error()
                    .client()
                    .setError(Errors.ENTITY_NOT_EXISTS)
                    .send(res);
            }

            const response = {
                token: user.generateToken("90d")
            } as AuthenticationSuccessDTO;

            return builder
                .success()
                .setData(response)
                .send(res);
        }
    }
}