import {HydratedDocument, Types} from "mongoose";
import {Inject, Service} from "typedi";
import User, {IUser} from "../model/UserModel";
import Repository from "../Repository";
import generateToken from "../../utils/GenerateToken";

@Service()
export default class UserRepository extends Repository<IUser> {

    /**
     * Finds user by id and returns it.
     * @param id Id of user to find in object id form or string form.
     * @returns User with given id or null if not found.
     */
    public async getById(id: string | Types.ObjectId): Promise<HydratedDocument<IUser> | null> {
        const user = await User.findById(id);

        return user;
    }

    /**
     * Finds user by email.
     * @param email Email to search for.
     * @returns User with given email or null if not found.
     */
    public async getByEmail(email: string): Promise<HydratedDocument<IUser> | null> {
        const user = await User.findOne({
            email: email
        });

        return user;
    }

    /**
     * Checks if user with given token exists.
     * @param token Token to search for.
     */
    async existsByToken(token: string): Promise<boolean> {
        return (await User.exists({
            token: token
        })) !== null;
    }

    /**
     * Finds user by token.
     * @param token Token to search for.
     */
    public async getByToken(token: string): Promise<HydratedDocument<IUser> | null> {
        const user = await User.findOne({
            token: token
        });

        return user;
    }

    /**
     * Creates new user.
     * @param param User data.
     * @param tokenGenerator Function that generates token for user.
     */
    async create(param: { password: string; name: string; email: string }, tokenGenerator?: () => string) {
        const {password, name, email} = param;

        if (!tokenGenerator) {
            tokenGenerator = () => {
                return generateToken(128)
            };
        }

        let token = tokenGenerator();

        while (await this.existsByToken(token)) {
            console.log("User with token " + token + " already exists. Generating new token.");
            token = tokenGenerator();
        }

        let verifyCode = generateToken(128);

        while (await this.existsByVerifyCode(verifyCode)) {
            console.log("User with verify code " + verifyCode + " already exists. Generating new verify code.");
            verifyCode = generateToken(128);
        }

        const user = await User.create({
            password,
            name,
            email,
            verifyCode: verifyCode,
            token: token,
            active: false
        });

        await user.save();

        return user;
    }

    async forceCreate(data: { name: string; email: string; active: boolean }) {
        const created = await this.create({
            name: data.name,
            email: data.email,
            password: 'FORCE_CREATED_USER',
        });

        created.active = data.active;

        await created.save();

        return created;
    }

    /**
     * Activates user with given id.
     * @param id Id of user to activate.
     */
    public async activate(id: any) {
        return User.updateOne({
            _id: id
        }, {
            active: true
        });
    }

    async getAll() {
        return User.find();
    }

    async exists(userCreate: string) {
        return User.exists({
            _id: userCreate
        });
    }

    async update(user: string, data: {
        name?: string;
        active?: boolean;
        email?: string,
        password?: string,
        lastPasswordChange?: Date,
        disabled?: boolean
    }) {
        let changes = {} as Record<string, any>;

        if (data.name !== undefined) changes['name'] = data.name;
        if (data.active !== undefined) changes['active'] = data.active;
        if (data.email !== undefined) changes['email'] = data.email;
        if (data.password !== undefined) changes['password'] = data.password;
        if (data.lastPasswordChange !== undefined) changes['lastPasswordChange'] = data.lastPasswordChange;
        if (data.disabled !== undefined) changes['disabled'] = data.disabled;

        await User.updateOne({
            _id: user
        }, {
            $set: changes
        });
    }

    async remove(user: string) {
        await User.deleteOne({
            _id: user
        });
    }
    private async existsByVerifyCode(code: string) {
        return User.exists({
            verifyCode: code
        });
    }
}