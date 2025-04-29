import {IsString, MaxLength, MinLength} from "class-validator";

export default class UpdateUserDTO {
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    password: string | undefined;

    @MaxLength(255)
    @IsString()
    @MinLength(3)
    name: string | undefined;

    @IsString()
    @MinLength(3)
    @MaxLength(255)
    currentPassword: string;
}
