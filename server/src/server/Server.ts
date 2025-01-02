import express from "express";
import helmet from "helmet";
import cors from "cors";
import Database from "../database/Database";
import Route from "../routes/Route";
import RouteManager from "../routes/RouteManager";
import Container from "typedi";

import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

/**
 * Represents the server. Manages all routes, database connections and other server related stuff.
 */
export default class Server {
    private routeManager: RouteManager;
    private app: express.Express;
    private database: Database;

    constructor() {
        this.app = express();

        this.database = Container.get(Database);
        this.routeManager = Container.get(RouteManager);
    }

    /**
     * Starts the server. Connects to the database and starts listening on port.
     */
    public async run() {
        await this.database.connect();

        if (!process.env.FRONTEND_DOMAIN) {
            console.warn("FRONTEND_DOMAIN environment variable is not set, CORS will allow all domains.");
        }

        this.app.enable("trust proxy")
        this.app.use(express.json({
            limit: "50mb"
        }));
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(cors({
            origin: [process.env.FRONTEND_DOMAIN ?? "*",
                "http://localhost",
                "capacitor://localhost",
            ],
            exposedHeaders: ["Content-Disposition"],
            maxAge: 86400,
        }));
        this.app.use(helmet({
            frameguard: false,
            contentSecurityPolicy: false,
            crossOriginResourcePolicy: {policy: "cross-origin"},
            hidePoweredBy: true,
        }));

        this.app.use(slowDown({
            windowMs: 15 * 60 * 1000,
            delayAfter: 5000,
            delayMs: 100,
            maxDelayMs: 10000
        }));
        this.app.use(rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 10000,
            standardHeaders: false,
            legacyHeaders: true
        }));

        for (const route of this.routeManager.getRoutes()) {
            this.app.use(route.initializeRoutes());
        }

        this.app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }

    /**
     * Registers a route.
     * @param route Route to register.
     * @returns This server.
     */
    public registerRoute(route: Route) {
        this.routeManager.registerRoute(route);

        return this;
    }

    /**
     * Registers multiple routes.
     * @param routes Routes to register.
     * @returns This server.
     */
    public registerRoutes(...routes: Route[]) {
        for (const route of routes) {
            this.registerRoute(route);
        }

        return this;
    }

}