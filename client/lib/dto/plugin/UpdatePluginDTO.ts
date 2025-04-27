import {IsArray, IsEnum, IsOptional, IsString, MaxLength, MinLength} from "class-validator";

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
