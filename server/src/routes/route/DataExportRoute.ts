import {Request, Response, Router} from "express";
import {Inject, Service} from "typedi";
import VerifyToken from "../../middleware/VerifyToken";
import Route from "../Route";
import OneDataExportController from "../../controller/dataExport/OneDataExportController";
import CreateDataExportController from "../../controller/dataExport/CreateDataExportController";
import LockRoute from "../../middleware/LockRoute";

@Service()
export default class DataExportRoute extends Route {

    constructor(
        @Inject(() => OneDataExportController) private readonly oneDataExportController: OneDataExportController,
        @Inject(() => CreateDataExportController) private readonly createDataExportController: CreateDataExportController,
    ) {
        super();
    }

    public initializeRoutes(): Router {
        const router: Router = Router();

        router.get('/data-export', VerifyToken(), (req: Request, res: Response) => this.oneDataExportController.handle(req, res));
        router.post('/data-export', VerifyToken(), LockRoute('DataExport'), (req: Request, res: Response) => this.createDataExportController.handle(req, res));

        return router;
    }

}