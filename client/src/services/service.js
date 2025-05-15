import axios from "axios";

/**
 * Base service class that provides a configured Axios HTTP client
 * and utility methods for making API requests.
 *
 * Subclasses can use `this.http` to perform HTTP operations with
 * shared settings such as base URL and default headers.
 */
class Service {
    /**
     * Creates an instance of the Service class with a preconfigured Axios HTTP client.
     *
     * The Axios instance (`this.http`) is configured with a base API URL and
     * common headers for content type and CORS policy.
     *
     * An interceptor is added to attach the Bearer token from localStorage to
     * the Authorization header on each request if the token exists.
     */
    constructor() {
        this.http = axios.create({
            baseURL: "/api",
            headers: {
                "Content-type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE",
            },
        });

        // Attach token dynamically on each request if token exists
        this.http.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

}

export default Service;
