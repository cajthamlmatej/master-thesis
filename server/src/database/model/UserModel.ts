import {HydratedDocument, model, Schema} from 'mongoose';

import jwt from 'jsonwebtoken';
import UserDTO from "../../../lib/dto/response/user/UserDTO";

interface IUser {
    /**
     * The name of the user.
     */
    name: string;
    /**
     * The email of the user.
     */
    email: string;
    /**
     * The password of the user in hashed form.
     */
    password: string;

    /**
     * If the user activated his account.
     */
    active: boolean;

    /**
     * Token for the user that is used for email verification.
     */
    token?: string;

    /**
     * The date of the last password change.
     */
    lastPasswordChange?: Date;

    /**
     * Generates a token for the user.
     *
     * @param time The time for which the token is valid. For example, "7d" means that the token is valid for 7 days.
     */
    generateToken(time?: string): string;

    /**
     * Converts the user to a UserDTO.
     */
    toDTO(): UserDTO;
}

const userSchema = new Schema<IUser>({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    active: {type: Boolean, default: true},
    token: {type: String, required: false},
    lastPasswordChange: {type: Date, required: false}
}, {
    timestamps: true
});

userSchema.methods.generateToken = function (time: string = "7d") {
    let secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error("No JWT secret set.");
        secret = "secret";
    }

    console.log("Generating token for user " + this.name + " with id " + this._id + " at " + new Date().toISOString() + ".");

    return jwt.sign(
        {
            id: this._id, name: this.name
        },
        secret,
        {
            expiresIn: time
        });
};
userSchema.method<HydratedDocument<IUser>>('toDTO', function () {
    return {
        id: this.id,
        name: this.name,
        email: this.email,
        active: this.active
    } as UserDTO;
});


const User = model<IUser>('User', userSchema);

export default User;
export {IUser};