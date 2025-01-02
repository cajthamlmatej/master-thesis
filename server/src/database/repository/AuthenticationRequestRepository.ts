import {HydratedDocument, Types} from "mongoose";
import {Service} from "typedi";
import AuthenticationRequest, {IAuthenticationRequest} from "../model/AuthenticationRequestModel";
import {IUser} from "../model/UserModel";
import Repository from "../Repository";

@Service()
export default class AuthenticationRequestRepository extends Repository<IAuthenticationRequest> {
    /**
     * Returns authentication request by id.
     * @param id Id of authentication request to return.
     */
    public async getById(id: string | Types.ObjectId): Promise<HydratedDocument<IAuthenticationRequest> | null> {
        const authenticationRequest = await AuthenticationRequest.findById(id);

        return authenticationRequest;
    }

    /**
     * Creates new authentication request for user.
     * @param user User to create authentication request for.
     * @param code Code to use for authentication request.
     * @param expiration Expiration date for authentication request.
     */
    public async create(user: HydratedDocument<IUser>, code: string, expiration: Date) {
        const authenticationRequest = new AuthenticationRequest({
            user: user._id,
            code,
            expiresAt: expiration,
            used: false
        });

        await authenticationRequest.save();
    }

    /**
     * Returns valid authentication request for user. Valid request is one that is not used and has not expired.
     * @param user User to get authentication request for.
     * @returns Valid authentication request for user. Null if there is no valid authentication request for user.
     */
    public async getValidForUser(user: HydratedDocument<IUser>): Promise<HydratedDocument<IAuthenticationRequest> | null> {
        const authenticationRequest = AuthenticationRequest.findOne({
            user: user._id,
            used: false,
            expiresAt: {
                $gt: new Date()
            }
        });

        return authenticationRequest;
    }

    /**
     * Marks authentication request as used.
     * @param authenticationRequest Authentication request to mark as used.
     */
    public async markAsUsed(authenticationRequest: HydratedDocument<IAuthenticationRequest>): Promise<void> {
        authenticationRequest.used = true;
        await authenticationRequest.save();
    }

    /**
     * Returns true if there is a valid authentication request for user. Valid request is one that is not used and has not expired.
     * @param code  Code to check
     * @returns True if there is a valid authentication request for user. False otherwise.
     */
    public async existsValidByCode(code: string): Promise<boolean> {
        const authenticationRequest = await AuthenticationRequest.findOne({
            code,
            used: false,
            expiresAt: {
                $gt: new Date()
            }
        });

        return authenticationRequest !== null;
    }

    public async getForUser(id: string | Types.ObjectId): Promise<HydratedDocument<IAuthenticationRequest>[]> {
        const authenticationRequests = await AuthenticationRequest.find({
            user: id
        });

        return authenticationRequests;
    }

    public async deleteAllForUser(id: string | Types.ObjectId): Promise<void> {
        await AuthenticationRequest.deleteMany({
            user: id
        });
    }
}