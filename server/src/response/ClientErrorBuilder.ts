import {Response} from "express";
import moment from "moment";
import {Error, Errors} from "../../lib/Errors";

/**
 * Builds a client error response.
 */
export class ClientErrorResponseBuilder {
    private readonly status = "client-error";
    private code = 400;
    private error: Error = Errors.GENERIC;
    private data: string | undefined = undefined;
    private meta: any = {};

    /**
     * Sets the status code of the response. Must be between 400 and 499 or an error is thrown.
     *
     * @param code Status code to set between 400 and 499.
     * @returns This builder.
     */
    public setCode(code: number) {
        if (code < 400 || code > 499)
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
     * Sets the metaobject of the response for additional information to be sent to the client.
     *
     * @param meta Meta object to set.
     * @returns This builder.
     */
    public setMeta(meta: any) {
        this.meta = meta;
        return this;
    }

    /**
     * Sets the data object of the response for additional information to be sent to the client. Used for additonal information about the error.
     *
     * @param data Data object to set.
     * @returns This builder.
     */
    public setData(data: string) {
        this.data = data;
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
                requested: moment().toISOString(),
                ...this.meta
            },
            error: {
                ...this.error,
                data: this.data
            }
        })
    }
}