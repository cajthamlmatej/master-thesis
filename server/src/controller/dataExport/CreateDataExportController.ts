import * as express from 'express'
import {Inject, Service} from 'typedi';
import builder from '../../response/Builder';
import Controller from '../Controller';
import DataExportRepository from "../../database/repository/DataExportRepository";
import {Errors} from "../../../lib/Errors";


@Service()
export default class CreateDataExportController extends Controller {

    constructor(
        @Inject(() => DataExportRepository) private dataExportRepository: DataExportRepository,
    ) {
        super();
    }

    async handle(req: express.Request, res: express.Response) {
        if (!req.user) return;

        const dataExport = await this.dataExportRepository.forUser(req.user.id);

        // If dataExport was created in less than 30 days, return not found
        if (dataExport && dataExport.finishedAt && ((new Date().getTime() - dataExport.finishedAt.getTime()) / 1000 / 60 / 60 / 24) < 30) {
            builder
                .error()
                .client()
                .setError(Errors.BODY_VALIDATION)
                .setData('Data Export can be created only once per 30 days.')
                .send(res);
            return;
        }

        if (dataExport && ['PENDING'].includes(dataExport.status)) {
            builder
                .error()
                .client()
                .setError(Errors.BODY_VALIDATION)
                .setData('Data Export can be created only once per 30 days.')
                .send(res);
            return;
        }

        await this.dataExportRepository.create(req.user.id);

        builder
            .success()
            .send(res);
    }
}