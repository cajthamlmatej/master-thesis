import {MaterialDTO} from "../../../lib/dto/material/MaterialDTO";
import Material from "@/models/Material";
import {MaterialMethod, MaterialSizing, MaterialVisibility} from "../../../lib/dto/material/MaterialEnums";

export default class MaterialMapper {

    public static fromMaterialDTO(dto: MaterialDTO | (Omit<MaterialDTO, "slides"> & { thumbnail?: string })): Material {
        return new Material(dto.id, dto.createdAt, dto.updatedAt, dto.name,
            'slides' in dto ? dto.slides : [],
            dto.visibility as MaterialVisibility, dto.method as MaterialMethod, dto.automaticTime, dto.sizing as MaterialSizing,
            'thumbnail' in dto ? dto.thumbnail : undefined);
    }

}
