import {MaterialDTO} from "../../../lib/dto/material/MaterialDTO";
import Material from "@/models/Material";
import {MaterialMethod, MaterialSizing, MaterialVisibility} from "../../../lib/dto/material/MaterialEnums";
import {OneMaterialSuccessDTO} from "../../../lib/dto/material/OneMaterialSuccessDTO";

export default class MaterialMapper {

    public static fromMaterialDTO(dto: MaterialDTO | (Omit<MaterialDTO & {
        thumbnail: string | undefined
    }, "slides">) | OneMaterialSuccessDTO["material"]): Material {
        return new Material(dto.id, dto.createdAt, dto.updatedAt, dto.name,
            'slides' in dto ? dto.slides : [],
            'plugins' in dto ? dto.plugins : [],
            dto.visibility as MaterialVisibility, dto.method as MaterialMethod, dto.automaticTime, dto.sizing as MaterialSizing,
            dto.featured,
            dto.attendees,
            dto.user,
            'thumbnail' in dto ? dto.thumbnail : undefined);
    }

}
