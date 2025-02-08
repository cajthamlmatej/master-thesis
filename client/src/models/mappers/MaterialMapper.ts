import Material from "@/models/Material";
import {MaterialDTO} from "../../../lib/dto/material/MaterialDTO";

export default class MaterialMapper {

    public static fromMaterialDTO(dto: MaterialDTO | (Omit<MaterialDTO, "slides"> & { thumbnail?: string })): Material {
        return new Material(dto.id, dto.createdAt, dto.updatedAt, dto.name, 'slides' in dto ? dto.slides : [], 'thumbnail' in dto ? dto.thumbnail : undefined);
    }

}
