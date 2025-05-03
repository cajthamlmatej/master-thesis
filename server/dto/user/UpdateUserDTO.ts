import {IsEmail, IsOptional, IsString, MaxLength, MinLength} from "class-validator";

export default class UpdateUserDTO {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    password?: string | undefined;

    @MaxLength(255)
    @IsOptional()
    @IsString()
    @MinLength(3)
    name?: string | undefined;

    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(255)
    currentPassword?: string | undefined;
}