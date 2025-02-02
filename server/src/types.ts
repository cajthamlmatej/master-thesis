import {HydratedDocument} from "mongoose";
import {User} from "./users/user.schema";

export type RequestWithUser = Request & { user: HydratedDocument<User> };