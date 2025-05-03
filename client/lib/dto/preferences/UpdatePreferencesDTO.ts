import {
    IsArray,
    IsBoolean, IsIn,
    IsNumber,
    IsOptional,
    IsString, Max,
    MaxLength,
    Min,
    MinLength,
    ValidateNested
} from "class-validator";
import {Type} from "class-transformer";

export class UpdatePreferencesDTO {
    @IsBoolean()
    KEEP_EDITOR_TO_FIT_PARENT: boolean;
    @IsBoolean()
    PER_OBJECT_TRANSFORMATION: boolean;
    @IsNumber()
    @Min(2)
    @Max(180)
    ROTATION_SNAPPING_COUNT: number;
    @IsNumber()
    @Min(1)
    @Max(1000)
    MOVEMENT_SNAPPING_DISTANCE: number;
    // @IsBoolean()
    // AUTOMATIC_SAVING: boolean;
    // @IsNumber()
    // @IsIn([
    //     30 * 1000,
    //     60 * 1000,
    //     2 * 60 * 1000,
    //     5 * 60 * 1000,
    //     10 * 60 * 1000,
    // ])
    // AUTOMATIC_SAVING_INTERVAL: number;
    @IsNumber()
    @Min(5)
    @Max(1000)
    HISTORY_LIMIT: number;

}