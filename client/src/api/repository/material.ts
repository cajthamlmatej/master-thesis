import {Repository} from "../repository";
import type OneUserSuccessDTO from "../../../lib/dto/response/user/OneUserSuccessDTO";
import type DeleteUserDTO from "../../../lib/dto/request/user/DeleteUserDTO";
import type {CreateMaterialSuccessDTO} from "../../../lib/dto/response/material/CreateMaterialSuccessDTO";
import type {AllMaterialSuccessDTO} from "../../../lib/dto/response/material/AllMaterialSuccessDTO";
import type {CreateMaterialDTO} from "../../../lib/dto/request/material/CreateMaterialDTO";
import type {UpdateMaterialDTO} from "../../../lib/dto/request/material/UpdateMaterialDTO";
import type {OneMaterialSuccessDTO} from "../../../lib/dto/response/material/OneMaterialSuccessDTO";

export class MaterialRepository extends Repository {
    public async all() {
        return await this.makeRequest<AllMaterialSuccessDTO>(
            `material`,
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
}
