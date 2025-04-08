import {
    IsArray,
    IsDefined, IsEnum, IsHexColor,
    IsIn,
    IsNumber,
    IsObject, IsOptional, IsPositive,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateNested
} from "class-validator";
import {Type} from "class-transformer";

export class UpdatePluginDTO {
    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(255)
    name?: string;

    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(255)
    icon?: string;

    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(255)
    description?: string;

    @IsArray()
    @IsOptional()
    @IsEnum([
        "WIDGETS",
        "CONTENT",
        "EDITOR",
        "PLAYER",
        "GAMIFICATION",
    ], {each: true})
    tags?: string[];
}