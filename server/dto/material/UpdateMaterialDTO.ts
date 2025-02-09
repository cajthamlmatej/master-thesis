import {
    IsArray,
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateNested
} from "class-validator";
import {Type} from "class-transformer";


export class UpdateSlideMaterialDTO {
    @IsString()
    @MaxLength(36)
    @MinLength(36)
    id: string;
    @IsString()
    data: string;
    @IsString()
    @IsOptional()
    thumbnail?: string;
    @IsNumber()
    position: number;
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