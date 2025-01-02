import {Request, Response} from "express";
import Joi from "joi";
import {Errors} from "../../lib/Errors";
import builder from "../response/Builder";

/**
 * Validates the body of a request against a Joi schema. If the validation fails, the response is sent and the request is terminated.
 * @param schema Joi schema to validate against.
 * @returns The validated body if the validation succeeds, otherwise null.
 */
export default function <T>(schema: Joi.ObjectSchema): (req: Request, res: Response) => T | null {
    return (req: Request, res: Response) => {
        const validate = schema.required().validate(req.body);

        if (validate.error) {
            builder
                .error()
                .client()
                .setError(Errors.BODY_VALIDATION)
                .setData(validate.error.message)
                .send(res);

            return null;
        }

        // Programmer should be held responsible for type safety of scheme and return type.
        return validate.value as T;
    };
}