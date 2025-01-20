import * as express from 'express'
import builder from '../../response/Builder';
import ValidateBody from '../../middleware/ValidateBody';
import {Inject, Service} from 'typedi';

import Controller from '../Controller';
import {HydratedDocument, Model} from "mongoose";
import Joi from 'joi';
import {CreateRepository, OneRepository} from "./BaseTypes";
import {Errors} from "../../../lib/Errors";

@Service()
export default class OneController<EntityType extends {
    toDTO(): DTOResponseEntity
}, DTOResponse, DTOResponseEntity> extends Controller {

    constructor(
        private repository: OneRepository<EntityType>,
        private parameter: string,
    ) {
        super();
    }

    public async handle(req: express.Request, res: express.Response) {
        const id = req.params[this.parameter];

        if (!id) {
            builder
                .error()
                .client()
                .setError(Errors.VALIDATION)
                .send(res);
            return;
        }

        const data = await this.repository.getOneById(id);

        if (!data) {
            builder
                .error()
                .client()
                .setError(Errors.ENTITY_NOT_EXISTS)
                .send(res);
            return;
        }

        const response = {
            entity: data.toDTO()
        } as DTOResponse;

        builder
            .success()
            .setData(response)
            .send(res);
    }
}