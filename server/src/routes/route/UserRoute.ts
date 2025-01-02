import {Router} from "express";
import {Inject, Service} from "typedi";
import VerifyToken from "../../middleware/VerifyToken";
import Route from "../Route";
import OneUserController from "../../controller/user/OneUserController";
import ValidateObjectIdParameter from "../../middleware/ValidateObjectIdParameter";
import UpdateUserController from "../../controller/user/UpdateUserController";
import RemoveUserController from "../../controller/user/RemoveUserController";

@Service()
export default class UserRoute extends Route {

    constructor(
        @Inject(() => OneUserController) private readonly oneUserController: OneUserController,
        @Inject(() => UpdateUserController) private readonly updateUserController: UpdateUserController,
        @Inject(() => RemoveUserController) private readonly removeUserController: RemoveUserController,
    ) {
        super();
    }

    public initializeRoutes(): Router {
        const router: Router = Router();

        router.param('user', ValidateObjectIdParameter('user'));

        router.get('/user/:user', VerifyToken(true), this.oneUserController.handle.bind(this.oneUserController));
        router.patch('/user/:user', VerifyToken(true), this.updateUserController.handle.bind(this.updateUserController));
        router.delete('/user/:user', VerifyToken(true), this.removeUserController.handle.bind(this.removeUserController));

        return router;
    }

}