import * as express from 'express'
import Joi from "../../validation/joi";

import {Inject, Service} from 'typedi';

import UserRepository from '../../database/repository/UserRepository';
import AuthenticationRequestRepository from '../../database/repository/AuthenticationRequestRepository';

import Controller from '../Controller';
import {Errors} from '../../../lib/Errors';
import builder from '../../response/Builder';

import ValidateBody from '../../middleware/ValidateBody';
import ActivateAuthenticationDTO from "../../../lib/dto/request/authentication/ActivateAuthenticationDTO";

const schema = Joi.object({
    token: Joi.string()
});

@Service()
export default class ActivateAuthenticationController extends Controller {

    constructor(
        @Inject(() => UserRepository) private readonly userRepository: UserRepository,
        @Inject(() => AuthenticationRequestRepository) private readonly authenticationRequestRepository: AuthenticationRequestRepository,
    ) {
        super();
    }

    async handle(req: express.Request, res: express.Response) {
        const validate = ValidateBody<ActivateAuthenticationDTO>(schema)(req, res);

        if (!validate) return; // Should be handled by ValidateBody.

        const {token} = validate;

        const user = await this.userRepository.getByToken(token);

        // Token is invalid
        if (!user) {
            return builder
                .error()
                .client()
                .setError(Errors.ENTITY_NOT_EXISTS)
                .send(res);
        }

        // User is already activated
        if (user.active) {
            return builder
                .error()
                .client()
                .setError(Errors.ENTITY_ALREADY_EXISTS)
                .setData("This account is already activated.")
                .send(res);
        }

        // Activate user
        await this.userRepository.activate(user.id);

        return builder
            .success()
            .send(res);
    }
}