import {IsArray, IsDefined, IsIn, IsNumber, IsString, MaxLength, Min, MinLength, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {Prop} from "@nestjs/mongoose";
import {MaterialMethod, MaterialSizing, MaterialVisibility} from "../../src/materials/material.schema";

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
    @IsString()
    @IsIn(["PUBLIC", "PRIVATE"])
    visibility: string;

    @IsString()
    @IsIn(["AUTOMATIC", "MANUAL", "INTERACTIVITY"])
    method: string;

    @IsNumber()
    @Min(0)
    automaticTime: number;

    @IsString()
    @IsIn(["FIT_TO_SCREEN", "MOVEMENT"])
    sizing: string;

    @IsArray()
    @ValidateNested()
    @Type(() => CreateSlideMaterialDTO)
    slides: CreateSlideMaterialDTO[];
}