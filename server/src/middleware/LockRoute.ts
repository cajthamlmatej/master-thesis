import {NextFunction, Request, Response} from "express";
import {HydratedDocument} from "mongoose";
import {IUser} from "../database/model/UserModel";
import builder from "../response/Builder";
import {Errors} from "../../lib/Errors";

const cache = new Map<string, string[]>();

export default (name: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = (req as Request & {
            user: HydratedDocument<IUser>
        }).user;

        if (!user) {
            throw new Error("LockRoute has to be used after Authorization middleware");
        }

        if (cache.has(user.id)) {
            if (cache.get(user.id)!.includes(name)) {
                builder
                    .error()
                    .client()
                    .setCode(403)
                    .setError(Errors.LOCKED)
                    .send(res);

                return false;
            } else {
                cache.get(user.id)!.push(name);
                next();
            }
        } else {
            cache.set(user.id, [name]);
            next();
        }

        res.on("finish", () => {
            if (cache.has(user.id)) {
                const arr = cache.get(user.id)!;
                const index = arr.indexOf(name);
                if (index !== -1) {
                    arr.splice(index, 1);
                }
                if (arr.length === 0) {
                    cache.delete(user.id);
                }
            }
        });
    }
}