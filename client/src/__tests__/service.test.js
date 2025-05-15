import axios from "axios";
import Service from "../services/service";

jest.mock("axios");
// Mock localStorage for Jest tests
const localStorageMock = (() => {
    let store = {};
    return {
        getItem(key) {
            return store[key] || null;
        },
        setItem(key, value) {
            store[key] = value.toString();
        },
        clear() {
            store = {};
        },
        removeItem(key) {
            delete store[key];
        },
    };
})();

Object.defineProperty(global, "localStorage", {
    value: localStorageMock,
});


describe("Service class", () => {
    let service;
    let mockRequestConfig;

    beforeEach(() => {
        // Reset mocks and localStorage before each test
        jest.clearAllMocks();
        localStorage.clear();

        // Mock axios.create to return an object with interceptors.request.use mocked
        mockRequestConfig = {};
        axios.create.mockReturnValue({
            interceptors: {
                request: {
                    use: jest.fn((success, error) => {
                        // Save the interceptor callbacks for testing
                        mockRequestConfig.successInterceptor = success;
                        mockRequestConfig.errorInterceptor = error;
                    }),
                },
            },
            defaults: {},
        });

        service = new Service();
    });

    test("creates axios instance with correct baseURL and headers", () => {
        expect(axios.create).toHaveBeenCalledWith({
            baseURL: "/api",
            headers: {
                "Content-type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE",
            },
        });
    });

    test("request interceptor adds Authorization header if token exists", () => {
        // Set token in localStorage
        localStorage.setItem("token", "abc123");

        const config = { headers: {} };

        const result = mockRequestConfig.successInterceptor(config);

        expect(result.headers.Authorization).toBe("Bearer abc123");
    });

    test("request interceptor does not add Authorization header if no token", () => {
        const config = { headers: {} };

        const result = mockRequestConfig.successInterceptor(config);

        expect(result.headers.Authorization).toBeUndefined();
    });

    test("request interceptor error handler rejects with the error", async () => {
        const error = new Error("Request error");

        await expect(mockRequestConfig.errorInterceptor(error)).rejects.toThrow("Request error");
    });
});
