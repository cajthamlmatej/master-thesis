import {NextFunction, Request, Response} from 'express';
import {Errors} from '../../lib/Errors';
import builder from '../response/Builder';
import Repository from '../database/Repository';
import {HydratedDocument, Types} from 'mongoose';

/**
 * Validates the id parameter of a request is a valid ObjectId. The entity is then hydrated and attached to the request.
 * @param repository
 * @param name
 */
export default <T>(repository: Repository<T>, name: string) => {
    return async (req: Request, res: Response, next: NextFunction, params: string) => {
        if (!Types.ObjectId.isValid(params)) {
            return builder
                .error()
                .client()
                .setError(Errors.VALIDATION)
                .setData("Provided parameter is not a valid ObjectId.")
                .send(res);
        }

        const entity = await repository.getById(params);

        if (!entity) {
            return builder
                .error()
                .client()
                .setError(Errors.ENTITY_NOT_EXISTS)
                .setData("Entity does not exist.")
                .send(res);
        }

        // @ts-ignore
        req[name] = entity as HydratedDocument<T>;

        next();
    };
}