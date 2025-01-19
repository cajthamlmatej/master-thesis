import * as express from 'express'
import {Inject, Service} from 'typedi';
import {HydratedDocument, Model} from 'mongoose';

import builder from '../../response/Builder';

import Controller from '../Controller';
import Repository from "../../database/Repository";
import {AllRepository} from "./BaseTypes";


export default class AllController<EntityType extends {
    toDTO(): DTOResponseEntity
}, DTOResponse, DTOResponseEntity> extends Controller {

    constructor(
        private repository: AllRepository<EntityType>
    ) {
        super();
    }

    async handle(req: express.Request, res: express.Response) {
        const data = await this.repository.getAll(req);

        const response = {
            entities: data.map((entity: HydratedDocument<any>) => entity.toDTO()) as DTOResponseEntity[]
        } as DTOResponse;

        builder
            .success()
            .setData(response)
            .send(res);
    }
}