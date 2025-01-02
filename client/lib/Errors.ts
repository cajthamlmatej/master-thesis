/**
 * Interface that represents error that is returned to client.
 */
export interface Error {
    /**
     * Short code that represents error that can be used to recognize error on client side.
     */
    code: string,
    /**
     * Description of error that can be used to show to user. In english.
     */
    description: string,
}

export class Errors {
    /**
     * Generic error that is used when error is not specified.
     */
    static GENERIC = {code: "GENERIC", description: "Non-specified error happened."} as Error;

    /**
     * Error that is used when endpoint is not found.
     */
    static NOT_FOUND = {
        code: "NOT_FOUND",
        description: "This request was rejected. Requested endpoint does not exist."
    } as Error;

    /**
     * Error that is used when server is not able to process request.
     */
    static SERVER_ERROR = {
        code: "SERVER_ERROR",
        description: "This request was rejected. Server run into error. This incident was reported."
    } as Error;

    /**
     * Error that is used when request body is not in right format.
     */
    static BODY_VALIDATION = {
        code: "BODY_VALIDATION",
        description: "Attached body is not in right format for this endpoint. See following errors for more details."
    } as Error;

    /**3
     * Error that is used when request parameters are not in right format.
     */
    static VALIDATION = {
        code: "VALIDATION",
        description: "Attached parameters are in wrong format. See following errors for more details."
    } as Error;

    /**
     * Error that is used when request entity is not found.
     */
    static ENTITY_NOT_EXISTS = {code: "ENTITY_NOT_EXISTS", description: "Requested entity doesn't exists."} as Error;

    /**
     * Error that is used when request entity already exists.
     */
    static ENTITY_ALREADY_EXISTS = {
        code: "ENTITY_ALREADY_EXISTS",
        description: "Requested entity with unique attributes already exists."
    } as Error;

    /**
     * Authentication error that is used when user entered wrong code for authentication or activation.
     */
    static AUTHENTICATION_CODE_INVALID = {
        code: "AUTHENTICATION_CODE_INVALID",
        description: "Authentication code is invalid."
    } as Error;

    /**
     * Authentication error that is used when user already requested authentication code.
     */
    static AUTHENTICATION_CODE_ALREADY_SENT = {
        code: "AUTHENTICATION_CODE_ALREADY_SENT",
        description: "Authentication code is already sent."
    } as Error;

    /**
     * Authentication error that is used when user is not logged in.
     */
    static AUTHENTICATION_NOT_LOGGED = {
        code: "AUTHENTICATION_NOT_LOGGED",
        description: "You are not logged in."
    } as Error;

    /**
     * Authentication error that is used when user sent wrong token that is not valid or expired.
     */
    static AUTHENTICATION_INVALID_TOKEN = {
        code: "AUTHENTICATION_INVALID_TOKEN",
        description: "Your token is invalid."
    } as Error;

    /**
     * Authentication error that is used when user has not activated his account.
     */
    static AUTHENTICATION_NOT_ACTIVE = {
        code: "AUTHENTICATION_NOT_ACTIVE",
        description: "Your account is not active."
    } as Error;

    /**
     * Authorization error that is used when user is not allowed to perform action.
     */
    static AUTHORIZATION_NOT_ALLOWED = {
        code: "AUTHORIZATION_NOT_ALLOWED",
        description: "You are not allowed to perform this action. See following permissions that are needed."
    } as Error;

    /**
     * Server is using service that is currently unavailable.
     */
    static SERVICE_UNAVAILABLE: Error = {
        code: "SERVICE_UNAVAILABLE",
        description: "Service is currently unavailable. Please try again later."
    }

    /**
     * This resource is locked for this user. Its possible that user already requested this resource and it is still being processed.
     */
    static LOCKED: Error = {
        code: "LOCKED",
        description: "This resource is locked. Please try again later."
    }

    static NOT_ALLOWED: Error = {
        code: "NOT_ALLOWED",
        description: "You are not allowed to perform this action."
    }

}