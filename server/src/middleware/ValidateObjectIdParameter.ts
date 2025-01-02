import {NextFunction, Request, Response} from "express";
import builder from "../response/Builder";
import {Types} from "mongoose";
import {Errors} from "../../lib/Errors";

/**
 * Validates the id parameter of a request is a valid ObjectId. If the validation fails, the response is sent and the request is terminated.
 * @param params The parameter name(s) to validate.
 */
export default (params: string[] | string) => {
    const paramsArray = Array.isArray(params) ? params : [params];

    return (req: Request, res: Response, next: NextFunction) => {
        for (const param of paramsArray) {
            if (!req.params[param] || req.params[param].length === 0 || !Types.ObjectId.isValid(req.params[param])) {
                builder
                    .error()
                    .client()
                    .setError(Errors.VALIDATION)
                    .setData("Invalid id as parameter " + param + ".")
                    .send(res);

                return;
            }
        }

        next();
    }
}