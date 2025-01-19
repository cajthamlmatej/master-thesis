import * as express from 'express'
import builder from '../../response/Builder';
import {Inject, Service} from 'typedi';

import Controller from '../Controller';
import {Model} from "mongoose";
import {Errors} from "../../../lib/Errors";
import {DeleteRepository} from "./BaseTypes";

@Service()
export default class RemoveController<EntityType> extends Controller {

    constructor(
        private repository: DeleteRepository<EntityType>,
        private parameter: string
    ) {
        super();
    }

    public async handle(req: express.Request, res: express.Response) {
        const id = req.params[this.parameter];

        if(!id) {
            return builder
                .error()
                .client()
                .setError(Errors.ENTITY_NOT_EXISTS)
                .send(res);
        }

        await this.repository.delete(id);

        return builder
            .success()
            .send(res);
    }
}