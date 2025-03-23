import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {HydratedDocument, Model} from "mongoose";
import {AuthenticationRequest} from "./authenticationRequest.schema";
import {User} from "../users/user.schema";
import generateToken from "../utils/generateToken";
import moment from "moment";

@Injectable()
export class AuthService {
    constructor(@InjectModel(AuthenticationRequest.name) private authenticationRequestModel: Model<AuthenticationRequest>) {
    }

    async hasUserValidRequest(user: HydratedDocument<User>): Promise<boolean> {
        return (await this.authenticationRequestModel.exists({
            user: user._id,
            used: false,
            expiresAt: {$gt: new Date()}
        }).exec()) !== null;
    }

    async existsValidByCode(code: string): Promise<boolean> {
        return (await this.authenticationRequestModel.exists({
            code,
            used: false,
            expiresAt: {$gt: new Date()}
        }).exec()) !== null;
    }

    async getValidByCode(code: string): Promise<HydratedDocument<AuthenticationRequest> | null> {
        return this.authenticationRequestModel.findOne({
            code,
            used: false,
            expiresAt: {$gt: new Date()}
        }).exec();
    }


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

    async markRequestAsUsed(authenticationRequest: HydratedDocument<AuthenticationRequest>) {
        authenticationRequest.used = true;
        await authenticationRequest.save();
    }
}
