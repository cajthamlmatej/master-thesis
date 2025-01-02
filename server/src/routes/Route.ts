import {Router} from "express";

/**
 * Abstract class for Route that manages the routes.
 */
export default abstract class Route {
    /**
     * Initialize the routes.
     * @return {Router} The router.
     */
    public abstract initializeRoutes(): Router;
}