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

export class CreatePluginDTO {
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    name: string;

    @IsString()
    @MinLength(1)
    @MaxLength(255)
    icon: string;

    @IsString()
    @MinLength(1)
    @MaxLength(255)
    description: string;

    @IsArray()
    @IsEnum([
        "WIDGETS",
        "CONTENT",
        "EDITOR",
        "PLAYER",
        "GAMIFICATION",
    ], {each: true})
    tags: string[];
}