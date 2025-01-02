import {Service} from "typedi";
import Route from "./Route";

/**
 * Manages all routes in the application.
 */
@Service()
export default class RouteManager {
    private routes: Route[] = [];

    /**
     * Registers a route.
     * @param route Route to register.
     */
    public registerRoute(route: Route): void {
        this.routes.push(route);
    }

    /**
     * Returns all registered routes.
     * @returns All registered routes.
     */
    public getRoutes(): Route[] {
        return this.routes;
    }
}