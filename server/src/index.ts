import 'reflect-metadata';

import * as dotenv from 'dotenv'
import Server from "./server/Server";

import Container from 'typedi';

import AuthenticationRoute from "./routes/route/AuthenticationRoute";
import UserRoute from "./routes/route/UserRoute";
import DataExportRoute from "./routes/route/DataExportRoute";
import initialize from "./database/Initialize";
import {TaskManager} from "./task/TaskManager";
import {ProcessDataExportTask} from "./task/dataExport/ProcessDataExportTask";
import MigrationManager from "./database/migration/MigrationManager";
import {MarkDataExportAsArchivedTask} from "./task/dataExport/MarkDataExportAsArchivedTask";
import {RemoveDataExportTask} from "./task/dataExport/RemoveDataExportTask";

dotenv.config();

(async () => {
    const server = new Server();

    server.registerRoutes(
        Container.get(AuthenticationRoute),
        Container.get(UserRoute),
        Container.get(DataExportRoute),
    );

    await server.run();
    await initialize();

    const migrationManager = Container.get(MigrationManager);
    await migrationManager.process();

    const taskManager = Container.get(TaskManager);

    taskManager.register(Container.get(ProcessDataExportTask));
    taskManager.register(Container.get(MarkDataExportAsArchivedTask));
    taskManager.register(Container.get(RemoveDataExportTask));

    taskManager.process();
})();