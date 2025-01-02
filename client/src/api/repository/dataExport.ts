import {Repository} from "../repository";
import type OneDataExportSuccessDTO from "../../../lib/dto/response/dataExport/OneDataExportSuccessDTO";

export class DataExportRepository extends Repository {

    async one() {
        return await this.makeRequest<OneDataExportSuccessDTO>(
            `data-export`,
            "GET"
        );
    }

    async create() {
        return await this.makeRequest(
            `data-export`,
            "POST"
        );
    }
}