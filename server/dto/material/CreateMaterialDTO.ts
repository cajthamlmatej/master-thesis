import {
    IsArray,
    IsDefined, IsHexColor,
    IsIn,
    IsNumber,
    IsObject, IsPositive,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateNested
} from "class-validator";
import {Type} from "class-transformer";

export class SlideEditorSizeDataDTO {
    @IsNumber()
    @IsPositive()
    width: number;
    @IsNumber()
    @IsPositive()
    height: number;
}

export class SlideEditorDataDTO {
    @IsDefined()
    @IsObject()
    @ValidateNested()
    size: SlideEditorSizeDataDTO;
    @IsString()
    @IsHexColor()
    color: string;
}

export class SlideBlockDTO {
    @IsString()
    @IsDefined()
    id: string;
    @IsString()
    @IsDefined()
    type: string;

    // any other information
    [key: string]: any;
}

export class SlideDataDTO {
    @IsDefined()
    @IsObject()
    @ValidateNested()
    editor: SlideEditorDataDTO;

    @IsArray()
    @ValidateNested()
    @Type(() => SlideBlockDTO)
    blocks: SlideBlockDTO[];
}

export class CreateSlideMaterialDTO {
    @IsString()
    @MaxLength(36)
    @MinLength(36)
    id: string;
    @IsObject()
    @ValidateNested()
    data: SlideDataDTO;
    @IsNumber()
    position: number;
}

export class CreateMaterialPluginDTO {
    @IsString()
    plugin: string;
    @IsString()
    release: string;
}

export class CreateMaterialDTO {
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    name: string;
    @IsString()
    @IsIn(["PUBLIC", "PRIVATE"])
    visibility: string;

    @IsArray()
    @ValidateNested()
    @Type(() => CreateMaterialPluginDTO)
    plugins: CreateMaterialPluginDTO[];

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