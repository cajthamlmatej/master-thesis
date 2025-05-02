import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {HydratedDocument, Model} from "mongoose";
import {AuthenticationRequest} from "./authenticationRequest.schema";
import {User} from "../users/user.schema";
import generateToken from "../utils/generateToken";
import * as moment from "moment";

/**
 * Service responsible for handling authentication requests.
 */
@Injectable()
export class AuthService {
    constructor(@InjectModel(AuthenticationRequest.name) private authenticationRequestModel: Model<AuthenticationRequest>) {
    }

    /**
     * Checks if the user has a valid authentication request.
     * @param user The user document to check.
     * @returns A promise that resolves to true if a valid request exists, otherwise false.
     */
    async hasUserValidRequest(user: HydratedDocument<User>): Promise<boolean> {
        return (await this.authenticationRequestModel.exists({
            user: user._id,
            used: false,
            expiresAt: {$gt: new Date()}
        }).exec()) !== null;
    }

    /**
     * Checks if a valid authentication request exists for the given code.
     * @param code The authentication code to check.
     * @returns A promise that resolves to true if a valid request exists, otherwise false.
     */
    async existsValidByCode(code: string): Promise<boolean> {
        return (await this.authenticationRequestModel.exists({
            code,
            used: false,
            expiresAt: {$gt: new Date()}
        }).exec()) !== null;
    }

    /**
     * Retrieves a valid authentication request by its code.
     * @param code The authentication code to retrieve.
     * @returns A promise that resolves to the authentication request document or null if not found.
     */
    async getValidByCode(code: string): Promise<HydratedDocument<AuthenticationRequest> | null> {
        return this.authenticationRequestModel.findOne({
            code,
            used: false,
            expiresAt: {$gt: new Date()}
        }).exec();
    }

    /**
     * Creates a new authentication request for the given user.
     * @param user The user document for whom the request is created.
     * @returns A promise that resolves to the created authentication request document.
     */
    async createRequest(user: HydratedDocument<User>) {
        const generateCode = () => generateToken(6, '0123456789').padStart(6, '0');

        let code;

        do {
            code = generateCode();
        } while (await this.existsValidByCode(code));

        const expiration = moment().add(5, 'minutes').toDate();

        return await this.authenticationRequestModel.create({
            user: user._id,
            code,
            expiresAt: expiration,
            used: false
        });
    }

    /**
     * Marks the given authentication request as used.
     * @param authenticationRequest The authentication request document to mark as used.
     * @returns A promise that resolves when the operation is complete.
     */
    async markRequestAsUsed(authenticationRequest: HydratedDocument<AuthenticationRequest>) {
        authenticationRequest.used = true;
        await authenticationRequest.save();
    }

    /**
     * Retrieves all authentication requests for the given user.
     * @param user The user document whose requests are to be retrieved.
     * @returns A promise that resolves to an array of authentication request documents.
     */
    async getAllRequests(user: HydratedDocument<User>) {
        return this.authenticationRequestModel.find({
            user: user._id,
        });
    }
}
