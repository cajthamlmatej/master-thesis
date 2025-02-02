import {IsArray, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength, ValidateNested} from "class-validator";
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
    @IsArray()
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateSlideMaterialDTO)
    slides?: UpdateSlideMaterialDTO[];
}