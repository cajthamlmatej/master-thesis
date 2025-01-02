import {Service} from "typedi";
import mongoose from "mongoose";
import moment from "moment";



type MigrationCase = {
    date: string,
    process: () => Promise<void>
};

@Service()
export default class MigrationManager {
    private migrations: MigrationCase[] = [];

    public async process() {
        this.loadMigrations();
        const lastMigration = await this.getLastMigration();

        for (const migration of this.migrations) {
            const migrationDate = moment(migration.date, 'YYYY-MM-DD-HH-mm-ss');

            if (migrationDate.isAfter(lastMigration)) {
                console.log(`Processing migration ${migration.date}`);
                await migration.process();

                // Update last migration in database
                await mongoose.connection.db.collection('migrations').updateOne({}, {
                    $set: {
                        lastMigration: migrationDate.toDate()
                    }
                });

                console.log(`Finished migration ${migration.date}`);
            }
        }

        console.log('Finished all migrations');
    }

    private loadMigrations() {
        this.migrations = [
        ]
    }

    private async getLastMigration() {
        const found = await mongoose.connection.db.collection('migrations').findOne({});

        if (found) {
            return moment(found.lastMigration);
        } else {
            const lastMigration = moment('1970-01-01');

            await mongoose.connection.db.collection('migrations').insertOne({
                lastMigration: lastMigration.toDate()
            });

            return lastMigration;
        }
    }
}