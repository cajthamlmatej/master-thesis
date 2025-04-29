import {Repository} from "../repository";
import {AllMediaSuccessDTO} from "../../../lib/dto/media/AllMediaSuccessDTO";
import {CreateMediaSuccessDTO} from "../../../lib/dto/media/CreateMediaSuccessDTO";

export class MediaRepository extends Repository {

    public async forUser(user: string) {
        return await this.makeRequest<AllMediaSuccessDTO>(
            `user/${user}/media`,
            "GET"
        );
    }

    async create(file: File) {
        const form = new FormData();

        form.append("file", file);

        return await this.makeRequest<CreateMediaSuccessDTO>(
            `media`,
            "POST",
            form,
            {},
            true
        );
    }

}
