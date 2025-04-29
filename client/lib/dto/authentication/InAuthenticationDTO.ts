import {IsIn, IsOptional, IsString} from "class-validator";

class InAuthDTO {
    @IsIn(['EMAIL_PASSWORD', 'EMAIL'])
    type: 'EMAIL_PASSWORD' | 'EMAIL';
    /**
     * The email address of the user.
     */
    @IsString()
    email: string;
    /**
     * The password of the user.
     */
    @IsOptional()
    @IsString()
    password?: string;
    /**
     * The code used to authenticate the user.
     */
    @IsOptional()
    @IsString()
    code?: string;
}

export default InAuthDTO;
