import type {MaterialDTO} from "../../../lib/dto/response/material/MaterialDTO";
import Material from "@/models/Material";

export default class MaterialMapper {

    public static fromMaterialDTO(dto: MaterialDTO) {
        return new Material(dto.id, dto.createdAt, dto.name, dto.slides);
    }

}
