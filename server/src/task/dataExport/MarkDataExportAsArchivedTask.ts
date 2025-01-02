import {Inject, Service} from "typedi";
import {Task} from "../Task";
import DataExportRepository from "../../database/repository/DataExportRepository";
import fs from "fs";

@Service()
export class MarkDataExportAsArchivedTask implements Task {
    readonly id = "MarkDataExportAsArchivedTask";
    readonly caller = "AUTOMATIC";
    readonly interval = 1000 * 60 * 5 * 1;

    constructor(
        @Inject(() => DataExportRepository) private readonly dataExportRepository: DataExportRepository,
    ) {
    }


    async run() {
        const dataExports = await this.dataExportRepository.findFinished();

        for (const dataExport of dataExports) {
            if (!dataExport.finishedAt) continue;

            if (((new Date().getTime() - dataExport.finishedAt.getTime()) / 1000 / 60 / 60 / 24) < 3) continue;

            await this.dataExportRepository.update(dataExport._id, {
                status: 'ARCHIVED'
            });

            if (!dataExport.file) continue;

            // TODO
            //
            // // Remove file
            // const file = await this.fileRepository.getById(dataExport.file);
            //
            // if (!file) continue;
            //
            // await this.fileRepository.remove(file._id);
            //
            // if (!fs.existsSync(file.location)) continue;
            //
            // fs.unlinkSync(file.location);
            //
            // await this.dataExportRepository.update(dataExport._id, {
            //     file: undefined
            // });
        }
    }

}