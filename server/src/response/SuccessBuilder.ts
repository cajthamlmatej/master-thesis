import {Response} from "express";
import moment from "moment";

export class SuccessResponseBuilder {
    private readonly status = "success";
    private code = 200;

    private data: Object = {};

    /**
     * Sets the status code of the response. Must be between 200 and 299 or an error is thrown.
     *
     * @param code Status code to set between 200 and 299.
     * @returns This builder.
     */
    public setCode(code: number) {
        if (code < 200 || code > 299)
            throw new Error('Trying to set non-successful status code to success response.');

        this.code = code;
        return this;
    }

    /**
     * Sets the data object of the response for main information to be sent to the client.
     *
     * @param data Data object to set.
     * @returns This builder.
     */
    public setData(data: Object) {
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
                requested: moment().toISOString()
            },
            data: this.data
        })
    }
}