import * as express from 'express'
import builder from '../../response/Builder';
import ValidateBody from '../../middleware/ValidateBody';
import {Inject, Service} from 'typedi';

import Controller from '../Controller';
import {Model} from "mongoose";
import Joi from 'joi';
import {Errors} from "../../../lib/Errors";
import {UpdateRepository} from "./BaseTypes";

@Service()
export default class UpdateController<EntityType, DTORequest> extends Controller {

    constructor(
        private repository: UpdateRepository<EntityType>,
        private schema: Joi.ObjectSchema,
        private parameter: string
    ) {
        super();
    }

    public async handle(req: express.Request, res: express.Response) {
        const validate = ValidateBody<DTORequest>(this.schema)(req, res);

        if (!validate) return; // Should be handled by ValidateBody.

        const data = validate;

        const entity = await this.repository.exists(req.params[this.parameter]);

        if (!entity) {
            return builder
                .error()
                .client()
                .setError(Errors.ENTITY_NOT_EXISTS)
                .send(res);
        }

        await this.repository.update(req.params[this.parameter], data);

        return builder
            .success()
            .send(res);

    }
}