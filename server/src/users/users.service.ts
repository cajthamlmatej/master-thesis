import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {HydratedDocument, Model} from "mongoose";
import {User, UserDocument} from "./user.schema";
import generateToken from "../utils/generateToken";
import * as bcrypt from "bcrypt";
import {ConfigService} from "@nestjs/config";
import * as jwt from "jsonwebtoken";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        readonly configService: ConfigService) {
    }

    async getByEmail(email: string) {
        return this.userModel.findOne({email: email}).exec();
    }

    async getById(id: string) {
        return this.userModel.findById(id).exec();
    }

    async getByVerifyToken(token: string) {
        return this.userModel.findOne({token: token}).exec();
    }

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

    async activate(byToken: HydratedDocument<User>) {
        byToken.active = true;
        await byToken.save();
    }

    public async comparePassword(user: UserDocument, password: string): Promise<boolean> {
        return await bcrypt.compare(password, user.password);
    }

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

    public async hashPassword(password: string) {
        return await bcrypt.hash(password, 10);
    }

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
