import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {HydratedDocument, Model} from "mongoose";
import {User, UserDocument} from "./user.schema";
import generateToken from "../utils/generateToken";
import * as bcrypt from "bcrypt";
import {ConfigService} from "@nestjs/config";
import * as jwt from "jsonwebtoken";

/**
 * Service for managing user-related operations such as creation, authentication, and updates.
 */
@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        readonly configService: ConfigService) {
    }

    /**
     * Retrieves a user by their email address.
     * @param email - The email address of the user.
     * @returns A promise resolving to the user document or null if not found.
     */
    async getByEmail(email: string) {
        return this.userModel.findOne({email: email}).exec();
    }

    /**
     * Retrieves a user by their ID.
     * @param id - The ID of the user.
     * @returns A promise resolving to the user document or null if not found.
     */
    async getById(id: string) {
        return this.userModel.findById(id).exec();
    }

    /**
     * Retrieves a user by their verification token.
     * @param token - The verification token.
     * @returns A promise resolving to the user document or null if not found.
     */
    async getByVerifyToken(token: string) {
        return this.userModel.findOne({token: token}).exec();
    }

    /**
     * Creates a new user with the provided parameters.
     * @param param - An object containing the user's password, name, and email.
     * @returns A promise resolving to the created user document.
     */
    async create(param: { password: string; name: string; email: string }) {
        let token;

        do {
            token = generateToken(128);
        } while (await this.getByVerifyToken(token));

        const user = new this.userModel({
            ...param,
            active: false,
            token: token
        });

        await user.save();

        return user;
    }

    /**
     * Activates a user by setting their active status to true.
     * @param byToken - The user document to activate.
     */
    async activate(byToken: HydratedDocument<User>) {
        byToken.active = true;
        await byToken.save();
    }

    /**
     * Compares a plain-text password with the hashed password of a user.
     * @param user - The user document containing the hashed password.
     * @param password - The plain-text password to compare.
     * @returns A promise resolving to true if the passwords match, otherwise false.
     */
    public async comparePassword(user: UserDocument, password: string): Promise<boolean> {
        return await bcrypt.compare(password, user.password);
    }

    /**
     * Generates a JWT token for a user.
     * @param user - The user document for whom the token is generated.
     * @param time - The expiration time of the token (default is "7d").
     * @returns A promise resolving to the generated JWT token.
     */
    public async generateToken(user: UserDocument, time: string = "7d"): Promise<string> {
        let secret = this.configService.get<string>("JWT_SECRET")!.toString();

        return jwt.sign(
            {
                id: user._id, name: user.name
            },
            secret,
            {
                expiresIn: time as any
            });
    }

    /**
     * Hashes a plain-text password using bcrypt.
     * @param password - The plain-text password to hash.
     * @returns A promise resolving to the hashed password.
     */
    public async hashPassword(password: string) {
        return await bcrypt.hash(password, 10);
    }

    /**
     * Updates a user's information such as password or name.
     * @param id - The ID of the user to update.
     * @param data - An object containing the new password and/or name.
     */
    public async updateUser(id: string, data: { password: string | undefined; name: string | undefined; }) {
        const toChange = {
            password: data.password,
            name: data.name,
            lastPasswordChange: data.password ? new Date() : undefined
        };

        const user = await this.userModel.findByIdAndUpdate(id, {
            $set: toChange
        }).exec();
    }
}
