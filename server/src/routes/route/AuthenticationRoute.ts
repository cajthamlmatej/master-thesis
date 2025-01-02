import {Request, Response, Router} from "express";
import {Inject, Service} from "typedi";
import InAuthenticationController from "../../controller/authentication/InAuthenticationController";
import Route from "../Route";
import RegisterAuthenticationController from "../../controller/authentication/RegisterAuthenticationController";
import ActivateAuthenticationController from "../../controller/authentication/ActivateAuthenticationController";
import rateLimit from "express-rate-limit";

@Service()
export default class AuthenticationRoute extends Route {

    constructor(
        @Inject(() => InAuthenticationController) private readonly inAuthController: InAuthenticationController,
        @Inject(() => RegisterAuthenticationController) private readonly registerAuthController: RegisterAuthenticationController,
        @Inject(() => ActivateAuthenticationController) private readonly activateAuthController: ActivateAuthenticationController,
    ) {
        super();
    }

    public initializeRoutes(): Router {
        const router: Router = Router();

        router.post("/authentication/in",
            rateLimit({
                windowMs: 60 * 60 * 1000,
                max: 60,
                standardHeaders: false,
                legacyHeaders: true
            }),
            (req: Request, res: Response) => this.inAuthController.handle(req, res));

        router.post("/authentication/register",
            rateLimit({
                windowMs: 60 * 60 * 1000,
                max: 5,
                standardHeaders: false,
                legacyHeaders: true
            }),
            (req: Request, res: Response) => this.registerAuthController.handle(req, res));

        router.post("/authentication/activate",
            rateLimit({
                windowMs: 60 * 60 * 1000,
                max: 5,
                standardHeaders: false,
                legacyHeaders: true
            }),
            (req: Request, res: Response) => this.activateAuthController.handle(req, res));

        return router;
    }

}