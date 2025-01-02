import bcrypt from "bcrypt";
import User from "./model/UserModel";


export default async function initialize() {
    console.group("Database initialization");
    console.log('Trying to initialize database with sample data...');

    // TODO: Add sample data here.
    console.log('Database (user collection) is empty, creating sample data...');

    if ((await User.countDocuments()) === 0) {
        const users = [];

        const usersToCreate = [
            {
                name: "Testujicí Uživatel",
                email: "test@cajthaml.eu",
                password: bcrypt.hashSync("testtest", 15),
                active: true,
            }
        ];
        for (const user of usersToCreate) {
            users.push(await User.create(user));
        }

        console.log('Created users:', users.map(user => user.email));

        // TODO: create sample materials
    }



    console.groupEnd();
}