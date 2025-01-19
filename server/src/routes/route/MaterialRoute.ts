import {Router} from "express";
import {Inject, Service} from "typedi";
import VerifyToken from "../../middleware/VerifyToken";
import Route from "../Route";
import ValidateObjectIdParameter from "../../middleware/ValidateObjectIdParameter";
import {CreateMaterialController} from "../../controller/material/CreateMaterialController";
import {AllMaterialController} from "../../controller/material/AllMaterialController";
import {UpdateMaterialController} from "../../controller/material/UpdateMaterialController";

@Service()
export default class MaterialRoute extends Route {

    constructor(
        @Inject(() => AllMaterialController) private allMaterialController: AllMaterialController,
        @Inject(() => CreateMaterialController) private createMaterialController: CreateMaterialController,
        @Inject(() => UpdateMaterialController) private updateMaterialController: UpdateMaterialController
    ) {
        super();
    }

    public initializeRoutes(): Router {
        const router: Router = Router();

        router.param('material', ValidateObjectIdParameter('material'));

        router.get('/material', VerifyToken(true),
            (req, res) => this.allMaterialController.handle(req, res));
        router.post('/material', VerifyToken(true),
            (req, res) => this.createMaterialController.handle(req, res));
        router.patch('/material/:material', VerifyToken(true),
            (req, res) => this.updateMaterialController.handle(req, res));

        return router;
    }

}