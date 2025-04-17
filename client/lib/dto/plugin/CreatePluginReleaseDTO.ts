import {
    IsArray,
    IsDefined, IsHexColor,
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

export class CreatePluginReleaseDTO {
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    version: string;

    @IsString()
    @MinLength(1)
    @MaxLength(32768)
    changelog: string;

    @IsString()
    @MinLength(1)
    @MaxLength(32768)
    manifest: string;

    @IsString()
    @IsOptional()
    @MaxLength(131072)
    editorCode: string;

    @IsString()
    @IsOptional()
    @MaxLength(131072)
    playerCode: string;
}