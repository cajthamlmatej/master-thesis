import Material from "@/models/Material";
import {MaterialDTO} from "../../../lib/dto/material/MaterialDTO";

export default class MaterialMapper {

    public static fromMaterialDTO(dto: MaterialDTO) {
        return new Material(dto.id, dto.createdAt, dto.updatedAt, dto.name, dto.slides);
    }

}
