import {api} from "./api";

/**
 * Represents the repository that manages requests.
 */
export class Repository {

    /**
     * Makes a request to the API.
     * @param endpoint The endpoint to request.
     * @param method The method to use.
     * @param data The data to send.
     * @param headers The headers to send.
     * @param ignoreContentType If the content type should be ignored - ignores JSON.stringify, and headers.
     */
    public async makeRequest<response>(
        endpoint: string,
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        data?: any,
        headers?: { [key: string]: string },
        ignoreContentType: boolean = false
    ) {
        try {
            let formatedHeaders = headers ?? {} as { [key: string]: string };

            // Add the generated headers
            if (api.generateHeaders() !== undefined) {
                for (const [key, value] of Object.entries(api.generateHeaders())) {
                    if (value === undefined) continue

                    formatedHeaders[key] = value;
                }
            }

            // Add the content type if it's not ignored
            if (!ignoreContentType && !formatedHeaders["Content-Type"]) {
                formatedHeaders["Content-Type"] = "application/json";
            }

            const finishedRequest = await fetch(api.base + endpoint, {
                method: method,
                headers: {
                    ...formatedHeaders
                },
                body: ignoreContentType ? data : JSON.stringify(data)
            });

            const json = await finishedRequest.json();

            return json.data as response;
        } catch (err) {
            return undefined;
        }
    }


    public async makeRequestThrows<response>(
        endpoint: string,
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        data?: any,
        headers?: { [key: string]: string },
        ignoreContentType: boolean = false
    ) {
        try {
            let formatedHeaders = headers ?? {} as { [key: string]: string };

            // Add the generated headers
            if (api.generateHeaders() !== undefined) {
                for (const [key, value] of Object.entries(api.generateHeaders())) {
                    if (value === undefined) continue

                    formatedHeaders[key] = value;
                }
            }

            // Add the content type if it's not ignored
            if (!ignoreContentType && !formatedHeaders["Content-Type"]) {
                formatedHeaders["Content-Type"] = "application/json";
            }

            const finishedRequest = await fetch(api.base + endpoint, {
                method: method,
                headers: {
                    ...formatedHeaders
                },
                body: ignoreContentType ? data : JSON.stringify(data)
            });

            const json = await finishedRequest.json();

            return json.data as response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Makes a request to the API.
     * @param endpoint The endpoint to request.
     * @param method The method to use.
     * @param data The data to send.
     * @param headers The headers to send.
     * @param ignoreContentType If the content type should be ignored - ignores JSON.stringify, and headers.
     */
    public async makeRequestWithPossibleError<response>(
        endpoint: string,
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        data?: any,
        headers?: { [key: string]: string },
        ignoreContentType: boolean = false
    ) {
        try {
            let formatedHeaders = headers ?? {} as { [key: string]: string };

            // Add the generated headers
            if (api.generateHeaders() !== undefined) {
                for (const [key, value] of Object.entries(api.generateHeaders())) {
                    if (value === undefined) continue

                    formatedHeaders[key] = value;
                }
            }

            // Add the content type if it's not ignored
            if (!ignoreContentType && !formatedHeaders["Content-Type"]) {
                formatedHeaders["Content-Type"] = "application/json";
            }

            const finishedRequest = await fetch(api.base + endpoint, {
                method: method,
                headers: {
                    ...formatedHeaders
                },
                body: ignoreContentType ? data : JSON.stringify(data)
            });

            const json = await finishedRequest.json();

            if (json.error) {
                return json.error.code as string;
            }

            return json.data as response;
        } catch (err) {
            return undefined;
        }
    }

    /**
     * Makes a request to the API. Does not parse the response or request.
     * @param endpoint The endpoint to request.
     * @param method The method to use.
     * @param data The data to send.
     * @param headers The headers to send.
     */
    public async makeRequestRaw<response>(
        endpoint: string,
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        data?: any,
        headers?: { [key: string]: string }
    ) {
        try {
            let formatedHeaders = headers ?? {} as { [key: string]: string };

            // Add the generated headers
            if (api.generateHeaders() !== undefined) {
                for (const [key, value] of Object.entries(api.generateHeaders())) {
                    if (value === undefined) continue

                    formatedHeaders[key] = value;
                }
            }

            // Add the content type if its not present
            if (!formatedHeaders["Content-Type"]) {
                formatedHeaders["Content-Type"] = "application/json";
            }

            const finishedRequest = await fetch(api.base + endpoint, {
                method: method,
                headers: {
                    ...formatedHeaders
                },
                body: JSON.stringify(data)
            });

            return {
                blob: await finishedRequest.blob(),
                headers: finishedRequest.headers
            }
        } catch (err) {
            return undefined;
        }
    }
}