import {IsEmail, IsString, MaxLength, MinLength} from "class-validator";

export default class RegisterAuthenticationDTO {
    /**
     * The name of the user.
     */
    @MaxLength(255)
    @IsString()
    @MinLength(3)
    name: string;
    /**
     * The email address of the user.
     */
    @IsEmail()
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    email: string;
    /**
     * The password of the user.
     */
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    password: string;
}