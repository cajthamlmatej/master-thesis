import {IsArray, IsDefined, IsNumber, IsString, MaxLength, MinLength, ValidateNested} from "class-validator";
import {Type} from "class-transformer";

export class CreateSlideMaterialDTO {
    @IsString()
    @MaxLength(36)
    @MinLength(36)
    id: string;
    @IsString()
    data: string;
    @IsString()
    thumbnail?: string;
    @IsNumber()
    position: number;
}

export class CreateMaterialDTO {
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    name: string;
    @IsArray()
    @ValidateNested()
    @Type(() => CreateSlideMaterialDTO)
    slides: CreateSlideMaterialDTO[];
}