import {Inject, Service} from "typedi";
import {Task} from "../Task";
import DataExportRepository from "../../database/repository/DataExportRepository";

@Service()
export class RemoveDataExportTask implements Task {
    readonly id = "RemoveDataExportTask";
    readonly caller = "AUTOMATIC";
    readonly interval = 1000 * 60 * 5 * 1;

    constructor(
        @Inject(() => DataExportRepository) private readonly dataExportRepository: DataExportRepository,
    ) {
    }


    async run() {
        const dataExports = await this.dataExportRepository.findArchived();

        for (const dataExport of dataExports) {
            if (!dataExport.finishedAt) continue;

            if (((new Date().getTime() - dataExport.finishedAt.getTime()) / 1000 / 60 / 60 / 24) < 30) continue;

            await this.dataExportRepository.remove(dataExport._id);
        }
    }

}