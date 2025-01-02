import * as express from 'express'
import builder from '../../response/Builder';
import {Inject, Service} from 'typedi';

import Controller from '../Controller';
import UserRepository from "../../database/repository/UserRepository";
import {Errors} from "../../../lib/Errors";
import Joi from "../../validation/joi";
import ValidateBody from "../../middleware/ValidateBody";
import DeleteUserDTO from "../../../lib/dto/request/user/DeleteUserDTO";
import bcrypt from "bcrypt";
import AuthenticationRequestRepository from "../../database/repository/AuthenticationRequestRepository";
import DataExportRepository from "../../database/repository/DataExportRepository";

const schema = Joi.object({
    password: Joi.string().required(),
});
@Service()
export default class RemoveUserController extends Controller {

    constructor(
        @Inject(() => UserRepository) private userRepository: UserRepository,
        @Inject(() => AuthenticationRequestRepository) private authenticationRequestRepository: AuthenticationRequestRepository,
        @Inject(() => DataExportRepository) private dataExportRepository: DataExportRepository,
    ) {
        super();
    }

    public async handle(req: express.Request, res: express.Response) {
        const user = req.user;
        const targetUser = req.params.user;

        // Should be handled by middlewares.
        if (!targetUser) return;
        if (!user) return;

        if (targetUser === user.id.toString()) {
            const validate = ValidateBody<DeleteUserDTO>(schema)(req, res);

            if (!validate) return; // Should be handled by ValidateBody.

            const {password} = validate;

            // Check if password is correct.
            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return builder
                    .error()
                    .client()
                    .setError(Errors.BODY_VALIDATION)
                    .setData('Password is incorrect.')
                    .send(res);
            }
        } else {
            return builder
                .error()
                .client()
                .setError(Errors.NOT_ALLOWED)
        }

        const targetUserEntity = await this.userRepository.getById(targetUser);

        if (!targetUserEntity) {
            return builder
                .error()
                .client()
                .setError(Errors.ENTITY_NOT_EXISTS)
                .setData('Entity user does not exist.')
                .send(res);
        }

        // Auth requests
        await this.authenticationRequestRepository.deleteAllForUser(targetUserEntity.id);
        // Data exports - file from these will be deleted only and only if has to archive is false.
        await this.dataExportRepository.deleteAllForUser(targetUserEntity.id);

        // TODO


        // Delete user
        await this.userRepository.remove(targetUser);

        return builder
            .success()
            .send(res);
    }
}