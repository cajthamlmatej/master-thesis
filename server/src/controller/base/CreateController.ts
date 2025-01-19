import * as express from 'express'
import builder from '../../response/Builder';
import ValidateBody from '../../middleware/ValidateBody';
import {Inject, Service} from 'typedi';

import Controller from '../Controller';
import {Model} from "mongoose";
import Joi from 'joi';
import {CreateRepository} from "./BaseTypes";
import {Errors} from "../../../lib/Errors";

@Service()
export default class CreateController<EntityType extends {
    toDTO(): DTOResponseEntity
}, DTOResponse, DTOResponseEntity, DTORequest> extends Controller {

    constructor(
        private repository: CreateRepository<EntityType, DTORequest>,
        private schema: Joi.ObjectSchema,
        private validate?: (data: DTORequest) => Promise<boolean>,
        private modifyData?: (req: express.Request, data: DTORequest) => Promise<DTORequest>
    ) {
        super();
    }

    public async handle(req: express.Request, res: express.Response) {
        const validate = ValidateBody<DTORequest>(this.schema)(req, res);

        if (!validate) return; // Should be handled by ValidateBody.

        let data = validate as DTORequest;

        if(this.validate && !await this.validate(data)) {
            return builder
                .error()
                .client()
                .setError(Errors.VALIDATION)
                .send(res);
        }

        if(this.modifyData) {
            data = await this.modifyData(req, data);
        }

        const entity = await this.repository.create(data);

        const response = {
            entity: entity.toDTO() as DTOResponseEntity
        } as DTOResponse;

        return builder
            .success()
            .setData(response)
            .send(res);

    }
}