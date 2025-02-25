import http from "../common/NodeCommon";

/**
 * AuthenticationService handles authentication-related API calls.
 */
class AuthenticationService {

    /**
     * Sends a passcode to the specified identifier (email or phone number).
     * @param {string} identifier - The identifier string (email or phone number) to locate an existing Customer.
     * @returns {Promise} - A promise that resolves with the server response.
     */
    send_code(identifier) {
        return http.post(`/authentication/send-passcode`, { identifier });
    }

    /**
     * Verifies the passcode for the given identifier.
     * @param {string} identifier - The identifier string (email or phone number) to locate an existing Customer.
     * @param {string} passcode - The passcode to verify.
     * @returns {Promise} - A promise that resolves with the server response.
     */
    verify_passcode(identifier, passcode) {
        return http.post(`/authentication/verify-passcode`, { identifier, passcode });
    }
}

export default new AuthenticationService();
