import * as express from 'express'
import {Inject, Service} from 'typedi';
import builder from '../../response/Builder';
import Controller from '../Controller';
import DataExportRepository from "../../database/repository/DataExportRepository";
import {Errors} from "../../../lib/Errors";
import OneDataExportSuccessDTO from "../../../lib/dto/response/dataExport/OneDataExportSuccessDTO";


@Service()
export default class OneDataExportController extends Controller {

    constructor(
        @Inject(() => DataExportRepository) private dataExportRepository: DataExportRepository,
    ) {
        super();
    }

    async handle(req: express.Request, res: express.Response) {
        if (!req.user) return;

        const dataExport = await this.dataExportRepository.forUser(req.user.id);

        // If dataExport was created more than 30 days ago, return not found
        if (!dataExport || (dataExport.finishedAt && ((new Date().getTime() - dataExport.finishedAt.getTime()) / 1000 / 60 / 60 / 24) > 30)) {
            builder
                .error()
                .client()
                .setError(Errors.ENTITY_NOT_EXISTS)
                .setData('Entity Data Export does not exists.')
                .send(res);
            return;
        }

        builder
            .success()
            .setData({
                dataExport: dataExport.toDTO()
            } as OneDataExportSuccessDTO)
            .send(res);
    }
}