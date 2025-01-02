import {ClientErrorResponseBuilder} from "./ClientErrorBuilder";
import {ServerErrorResponseBuilder} from "./ServerErrorBuilder";
import {SuccessResponseBuilder} from "./SuccessBuilder";

/**
 * Builder class for creating response objects.
 */
class ResponseBuilder {
    constructor() {
    }

    /**
     * Creates a new success response builder. Represents a success response.
     * @returns New success response builder.
     */
    public success() {
        return new SuccessResponseBuilder();
    }

    /**
     * Creates a new error response builder. Represents an error response.
     * @returns New error response builder.
     */
    public error() {
        return {
            /**
             * Creates a new client error response builder. Represents an error response caused by the client.
             *
             * @returns New client error response builder.
             */
            client() {
                return new ClientErrorResponseBuilder();
            },

            /**
             * Creates a new server error response builder. Represents an error response caused by the server.
             *
             * @returns New server error response builder.
             */
            server() {
                return new ServerErrorResponseBuilder();
            }
        }
    }
}

export default new ResponseBuilder();