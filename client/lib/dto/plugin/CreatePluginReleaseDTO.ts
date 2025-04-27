import {IsOptional, IsString, MaxLength, MinLength} from "class-validator";

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
