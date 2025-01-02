import express from 'express';

/**
 * Base controller class.
 */
export default abstract class Controller {
    /**
     * Handle request.
     * @param req Request.
     * @param res Response.
     */
    public abstract handle(req: express.Request, res: express.Response): Promise<any> | any;
}