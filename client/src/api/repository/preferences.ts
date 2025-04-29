import {Repository} from "../repository";
import {OnePreferencesSuccessDTO} from "../../../lib/dto/preferences/OnePreferencesSuccessDTO";
import {UpdatePreferencesDTO} from "../../../lib/dto/preferences/UpdatePreferencesDTO";

export class PreferencesRepository extends Repository {
    public async forUser(user: string) {
        return await this.makeRequest<OnePreferencesSuccessDTO>(
            `user/${user}/preferences`,
            "GET"
        );
    }

    async update(user: string, data: UpdatePreferencesDTO) {
        return await this.makeRequest(
            `user/${user}/preferences`,
            "PATCH",
            data
        );
    }
}
