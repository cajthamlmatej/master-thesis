import {IsArray, IsEnum, IsString, MaxLength, MinLength} from "class-validator";

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
