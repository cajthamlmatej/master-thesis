import {model, Schema, Types} from 'mongoose';

/**
 * Represents an authentication request made by a user. Used for email authentication.
 */
interface IAuthenticationRequest {
    /**
     * The user for which the authentication request was made.
     */
    user: Types.ObjectId;
    /**
     * The code that was sent to the user.
     */
    code: string;
    /**
     * The time at which the authentication request expires.
     *
     * If the user does not authenticate within this time, the authentication request is no longer valid and cant be used.
     */
    expiresAt: Date;
    /**
     * Whether the authentication request has been used.
     */
    used: boolean;
}

const authenticationRequestSchema = new Schema<IAuthenticationRequest>({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    code: {type: String, required: true},
    expiresAt: {type: Date, required: true},
    used: {type: Boolean, required: true, default: false}
}, {
    timestamps: true
});

const AuthenticationRequest = model<IAuthenticationRequest>('AuthenticationRequest', authenticationRequestSchema);

export default AuthenticationRequest;
export {IAuthenticationRequest};