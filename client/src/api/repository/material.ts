import {Repository} from "../repository";
import {AllMaterialSuccessDTO} from "../../../lib/dto/material/AllMaterialSuccessDTO";
import {CreateMaterialDTO} from "../../../lib/dto/material/CreateMaterialDTO";
import {CreateMaterialSuccessDTO} from "../../../lib/dto/material/CreateMaterialSuccessDTO";
import {UpdateMaterialDTO} from "../../../lib/dto/material/UpdateMaterialDTO";
import {OneMaterialSuccessDTO} from "../../../lib/dto/material/OneMaterialSuccessDTO";

export class MaterialRepository extends Repository {
    public async forUser(user: string) {
        return await this.makeRequest<AllMaterialSuccessDTO>(
            `user/${user}/material`,
            "GET"
        );
    }

    async create(data: CreateMaterialDTO) {
        return await this.makeRequest<CreateMaterialSuccessDTO>(
            `material`,
            "POST",
            data
        );
    }

    async update(id: string, data: UpdateMaterialDTO) {
        return await this.makeRequest(
            `material/${id}`,
            "PATCH",
            data
        );
    }

    async one(id: string) {
        return await this.makeRequest<OneMaterialSuccessDTO>(
            `material/${id}`,
            "GET"
        );
    }

    async delete(id: string) {
        return await this.makeRequest(
            `material/${id}`,
            "DELETE"
        );
    }

    async export(id: string, type: string) {
        return this.makeRequestRaw(
            `material/${id}/export/${type}`,
            "GET"
        );
    }
}
