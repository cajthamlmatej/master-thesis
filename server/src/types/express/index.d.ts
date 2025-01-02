import {HydratedDocument} from "mongoose"
import {IUser} from "../../database/model/UserModel"

export {}

declare global {
    namespace Express {
        interface Request {
            user?: HydratedDocument<IUser>;

        }
    }
}
