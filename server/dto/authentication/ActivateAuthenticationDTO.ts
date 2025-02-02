import {IsNotEmpty, IsString} from "class-validator";


export default class ActivateAuthenticationDTO {
    /**
     * The token used to activate the account.
     */
    @IsString()
    @IsNotEmpty()
    token: string;
}