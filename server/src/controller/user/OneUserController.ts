import * as express from 'express'
import {Inject, Service} from 'typedi';

import builder from '../../response/Builder';
import Controller from '../Controller';
import OneUserSuccessDTO from "../../../lib/dto/response/user/OneUserSuccessDTO";
import {Errors} from "../../../lib/Errors";
import UserRepository from "../../database/repository/UserRepository";

@Service()
export default class OneUserController extends Controller {

    constructor(
        @Inject(() => UserRepository) private readonly userRepository: UserRepository,
    ) {
        super();
    }

    async handle(req: express.Request, res: express.Response) {
        const user = req.user;
        const targetUserId = req.params.user;

        // Should be handled by middlewares.
        if (!targetUserId) return;
        if (!user) return;

        if (targetUserId !== user.id) {
            return builder
                .error()
                .client()
                .setError(Errors.NOT_ALLOWED)
                .send(res);
        }

        const targetUser = await this.userRepository.getById(targetUserId);

        // Does user exist?
        if (!targetUser) {
            return builder
                .error()
                .client()
                .setError(Errors.ENTITY_NOT_EXISTS)
                .setData('Entity user does not exist.')
                .send(res);
        }

        const response = {
            user: targetUser.toDTO(),
        } as OneUserSuccessDTO;

        builder
            .success()
            .setData(response)
            .send(res);
    }
}