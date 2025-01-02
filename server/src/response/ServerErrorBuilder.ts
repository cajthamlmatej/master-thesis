import {Response} from "express";
import moment from "moment";
import {Error, Errors} from "../../lib/Errors";

/**
 * Builds a server error response.
 */
export class ServerErrorResponseBuilder {
    private readonly status = "server-error";
    private code = 500;
    private error: Error = Errors.GENERIC;

    /**
     * Sets the status code of the response. Must be between 500 and 599 or an error is thrown.
     *
     * @param code Status code to set between 500 and 599.
     * @returns This builder.
     */
    public setCode(code: number) {
        if (code < 500 || code > 599)
            throw new Error('Trying to set non-error status code to error response.');

        this.code = code;
        return this;
    }

    /**
     * Sets the error object of the response.
     *
     * @param error Error object to set.
     * @returns This builder.
     */
    public setError(error: Error) {
        this.error = error;
        return this;
    }

    /**
     * Sends the response to the client.
     *
     * @param res Express response object.
     * @returns This builder.
     */
    public send(res: Response) {
        res.status(this.code).json({
            meta: {
                status: this.status,
                requested: moment().toISOString()
            },
            error: {
                ...this.error
            }
        })
    }
}