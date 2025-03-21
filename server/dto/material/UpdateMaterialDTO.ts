import {
    IsArray,
    IsIn,
    IsNumber, IsObject,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateNested
} from "class-validator";
import {Type} from "class-transformer";
import {SlideDataDTO} from "./CreateMaterialDTO";


export class UpdateSlideMaterialDTO {
    @IsString()
    @MaxLength(36)
    @MinLength(36)
    id: string;
    @IsObject()
    @ValidateNested()
    data: SlideDataDTO;
    @IsNumber()
    position: number;
}

export class UpdateMaterialPluginDTO {
    @IsString()
    plugin: string;
    @IsString()
    release: string;
}

export class UpdateMaterialDTO {
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    @IsOptional()
    name?: string;
    @IsString()
    @IsIn(["PUBLIC", "PRIVATE"])
    @IsOptional()
    visibility?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateMaterialPluginDTO)
    plugins?: UpdateMaterialPluginDTO[];

    @IsString()
    @IsIn(["AUTOMATIC", "MANUAL", "INTERACTIVITY"])
    @IsOptional()
    method?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    automaticTime?: number;

    @IsString()
    @IsIn(["FIT_TO_SCREEN", "MOVEMENT"])
    @IsOptional()
    sizing?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateSlideMaterialDTO)
    slides?: UpdateSlideMaterialDTO[];
}