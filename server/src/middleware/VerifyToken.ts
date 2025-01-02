import {NextFunction, Request, Response} from 'express';
import {Errors} from '../../lib/Errors';
import builder from '../response/Builder';
import * as jwt from 'jsonwebtoken';
import UserRepository from '../database/repository/UserRepository';
import Container from "typedi";

const tokenHeader = "authorization";

/**
 * Verifies the token in the request header. Invalid token always results in an error response.
 *
 * @param required Whether the token is required. If not, the request will continue when no token is provided.
 */
export default (required: boolean = true) => {
    const userRepository = Container.get(UserRepository);

    return async (req: Request, res: Response, next: NextFunction) => {
        // Check if token is provided
        if (req.headers[tokenHeader]) {
            let tokenValue = req.headers[tokenHeader].toString();

            if(!tokenValue.startsWith("Bearer ")) {
                builder
                    .error()
                    .client()
                    .setCode(401)
                    .setError(Errors.AUTHENTICATION_INVALID_TOKEN)
                    .send(res);

                return;
            }

            const token = tokenValue.substring(7);

            if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set.");

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Check if token is valid - is signed by us and is not expired
                if (decoded) {
                    const decodedToken = decoded as {
                        id: string;
                        name: string;
                    }

                    // Find user
                    const user = await userRepository.getById(decodedToken.id);

                    if (user) {
                        // User exists. Token is valid. User is saved in request.
                        req.user = user;
                    } else {
                        // User does not exist. Token is invalid.
                        builder
                            .error()
                            .client()
                            .setCode(401)
                            .setError(Errors.AUTHENTICATION_INVALID_TOKEN)
                            .send(res);

                        return;
                    }

                    return next();
                }
            } catch (e) {
                // Token is invalid
                builder
                    .error()
                    .client()
                    .setCode(401)
                    .setError(Errors.AUTHENTICATION_INVALID_TOKEN)
                    .send(res);

                return;
            }

            return;
        } else if (required) {
            // Token is not provided, but is required.
            builder
                .error()
                .client()
                .setCode(401)
                .setError(Errors.AUTHENTICATION_NOT_LOGGED)
                .send(res);

            return;
        }

        next();
    };
}