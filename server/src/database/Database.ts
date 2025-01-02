import mongoose, {connect} from "mongoose";
import {Service} from "typedi";

/**
 * Represents the database. Manages the datbase connection and all repositories.
 */
@Service()
export default class Database {

    /**
     * Connects to the database.
     * @returns Promise that resolves when the connection is established.
     */
    public async connect() {
        mongoose.set('strictQuery', false);

        if (!process.env.DATABASE_URL) {
            console.error('No database url specified. Shutting down server.');
            process.exit(1);
        }

        await connect(process.env.DATABASE_URL, {}).then(() => {
            console.log('Database connected');
        }).catch((err) => {
            console.error('Database connection error', err);

            console.log('Shutting down server.');
            process.exit(1);
        });
    }

}