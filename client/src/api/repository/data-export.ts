import {Repository} from "../repository";
import OneDataExportSuccessDTO from "../../../lib/dto/data-export/OneDataExportSuccessDTO";

export class DataExportRepository extends Repository {

    public async get(user: string) {
        return await this.makeRequest<OneDataExportSuccessDTO>(
            `user/${user}/data-export`,
            "GET"
        );
    }

    public async create(user: string) {
        return await this.makeRequest(
            `user/${user}/data-export`,
            "POST"
        );
    }

    public async download(user: string, exportId: string) {
        return await this.makeRequestRaw(
            `user/${user}/data-export/${exportId}`,
            "GET"
        )
    }

}
