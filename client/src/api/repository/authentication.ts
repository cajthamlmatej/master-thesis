import {Repository} from "../repository";
import type AuthenticationSuccessDTO from "../../../lib/dto/response/authentication/AuthenticationSuccessDTO";
import type RegisterAuthenticationDTO from "../../../lib/dto/request/authentication/RegisterAuthenticationDTO";
import type ActivateAuthenticationDTO from "../../../lib/dto/request/authentication/ActivateAuthenticationDTO";

export class AuthenticationRepository extends Repository {

    /**
     * Requests an email password authentication.
     * @param email The email to authenticate.
     * @param password The password to authenticate.
     */
    public async requestEmailPassword(email: string, password: string) {
        return await this.makeRequest<AuthenticationSuccessDTO>(
            "authentication/in",
            "POST",
            {
                type: "EMAIL_PASSWORD",
                email: email,
                password: password,
            }
        );
    }

    /**
     * Requests an email code authentication or authenticates with a code.
     * @param email The email to authenticate.
     * @param code The code to authenticate.
     */
    public async requestEmail(email: string, code: string | undefined) {
        return await this.makeRequest<AuthenticationSuccessDTO>(
            "authentication/in",
            "POST",
            {
                type: "EMAIL",
                email: email,
                code: code,
            }
        );
    }

    /**
     * Registers a new user.
     * @param data The data to register.
     */
    public async register(data: RegisterAuthenticationDTO) {
        return await this.makeRequest(
            "authentication/register",
            "POST",
            data
        );
    }

    /**
     * Activates a user.
     * @param data The data to activate.
     */
    public async activate(data: ActivateAuthenticationDTO) {
        return await this.makeRequest(
            "authentication/activate",
            "POST",
            data
        );
    }

}
