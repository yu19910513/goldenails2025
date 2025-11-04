const { authenticateUser, authorizeAdmin, basic_auth, signToken, getTokenExpiration } = require('../utils/authentication'); // Update with the correct path
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test_secret';
const secret = process.env.JWT_SECRET;
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

describe('authenticateUser middleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 401 if no token is provided', () => {
        authenticateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith("Access Denied");
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if token is invalid', () => {
        req.headers.authorization = 'Bearer invalidtoken';
        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        authenticateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("Invalid Token");
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next and attach user to request if token is valid', () => {
        const mockUserData = { id: 1, name: 'Test User' };
        req.headers.authorization = 'Bearer validtoken';
        jwt.verify.mockReturnValue({ data: mockUserData });

        authenticateUser(req, res, next);

        expect(req.user).toEqual(mockUserData);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});

describe('authorizeAdmin middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            user: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    it('should deny access if no token is provided', () => {
        req.headers.authorization = undefined;

        authorizeAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith("Access Denied: No token provided");
        expect(next).not.toHaveBeenCalled();
    });

    it('should deny access if the token is invalid', () => {
        req.headers.authorization = 'Bearer invalid_token';
        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        authorizeAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token or unauthorized access' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should deny access if the token does not contain admin privileges', () => {
        const decodedToken = { data: { admin_privilege: false } };
        req.headers.authorization = 'Bearer valid_token';
        jwt.verify.mockReturnValue(decodedToken);

        authorizeAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Access Denied: Admins only");
        expect(next).not.toHaveBeenCalled();
    });

    it('should allow access if the token is valid and contains admin privileges', () => {
        const decodedToken = { data: { admin_privilege: true } };
        req.headers.authorization = 'Bearer valid_token';
        jwt.verify.mockReturnValue(decodedToken);

        authorizeAdmin(req, res, next);

        expect(req.user).toEqual(decodedToken.data);
        expect(next).toHaveBeenCalled();
    });

    it('should deny access if the token is expired', () => {
        const error = new Error('TokenExpiredError');
        error.name = 'TokenExpiredError';
        req.headers.authorization = 'Bearer expired_token';
        jwt.verify.mockImplementation(() => {
            throw error;
        });

        authorizeAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Token has expired" });
        expect(next).not.toHaveBeenCalled();
    });
});

describe('basic_auth', () => {
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };
    const mockNext = jest.fn();

    it('should call next if Referer is allowed', () => {
        process.env.ALLOWED_REFERRERS = 'http://allowed.com,https://anotherallowed.com';

        const req = { get: jest.fn().mockReturnValue('http://allowed.com') };
        const res = mockResponse();
        basic_auth(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if Referer is not allowed', () => {
        process.env.ALLOWED_REFERRERS = 'http://allowed.com,https://anotherallowed.com';

        const req = { get: jest.fn().mockReturnValue('http://notallowed.com') };
        const res = mockResponse();
        basic_auth(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized referrer' });
    });

    it('should return 403 if Referer header is missing', () => {
        process.env.ALLOWED_REFERRERS = 'http://allowed.com,https://anotherallowed.com';

        const req = { get: jest.fn().mockReturnValue('') };
        const res = mockResponse();
        basic_auth(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized referrer' });
    });
});

describe('signToken', () => {
    const mockPayload = { id: 123, name: 'John Doe' };
    const mockToken = 'mock.jwt.token';

    // Keep a clean copy of the environment
    const originalEnv = { ...process.env };

    beforeEach(() => {
        // Reset mocks and environment before each test
        jest.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.JWT_SECRET = 'testsecret'; // Set a default secret for most tests

        // Mock the return value for all sign calls
        jwt.sign.mockReturnValue(mockToken);
    });

    afterAll(() => {
        // Restore the original environment
        process.env = originalEnv;
    });

    // --- Test 1: Default Expiration ---
    it('should use the default "2h" expiration when none is provided', () => {
        const token = signToken(mockPayload);

        // This is your original test, and it's still valid
        expect(jwt.sign).toHaveBeenCalledWith(
            { data: mockPayload },
            'testsecret',
            { expiresIn: '2h' } // Checks the default
        );
        expect(token).toBe(mockToken);
    });

    // --- Test 2: Custom Expiration ---
    it('should use a custom expiration when provided (e.g., "7d")', () => {
        const token = signToken(mockPayload, '7d');

        expect(jwt.sign).toHaveBeenCalledWith(
            { data: mockPayload },
            'testsecret',
            { expiresIn: '7d' } // Checks the custom value
        );
        expect(token).toBe(mockToken);
    });

    // --- Test 3: Null Expiration (Non-expiring) ---
    it('should create a non-expiring token when expiration is null', () => {
        const token = signToken(mockPayload, null);

        // This is the most important new test.
        // It checks that the options object is empty ({}), 
        // which is what tells jwt.sign() to not add an 'exp' claim.
        expect(jwt.sign).toHaveBeenCalledWith(
            { data: mockPayload },
            'testsecret',
            {} // No expiresIn property!
        );
        expect(token).toBe(mockToken);
    });

    // --- Test 4: Missing Secret (Error Handling) ---
    it('should throw an error if JWT_SECRET is not defined', () => {
        // Explicitly delete the secret for this one test
        delete process.env.JWT_SECRET;

        // We test that calling the function...
        const attemptToSign = () => {
            signToken(mockPayload);
        };

        // ...throws the specific error.
        expect(attemptToSign).toThrow('JWT_SECRET is not defined in environment variables.');
    });
});

describe('getTokenExpiration', () => {
    // Store a copy of the original process.env
    const originalEnv = { ...process.env };

    beforeEach(() => {
        // Reset process.env before each test to a clean state
        // This prevents tests from interfering with each other
        process.env = { ...originalEnv };
        delete process.env.ADMIN_TOKEN_EXPIRATION;
        delete process.env.CUSTOMER_TOKEN_EXPIRATION;
    });

    afterAll(() => {
        // Restore the original environment after all tests have run
        process.env = originalEnv;
    });

    // --- Test Cases for Admin Users ---
    describe('when user is an admin (isAdmin = true)', () => {

        test('should return null if ADMIN_TOKEN_EXPIRATION is not set (undefined)', () => {
            // process.env.ADMIN_TOKEN_EXPIRATION is undefined by default
            expect(getTokenExpiration(true)).toBeNull();
        });

        test('should return null if ADMIN_TOKEN_EXPIRATION is the string "null"', () => {
            process.env.ADMIN_TOKEN_EXPIRATION = 'null';
            expect(getTokenExpiration(true)).toBeNull();
        });

        test('should return the specific duration string if set (e.g., "15m")', () => {
            process.env.ADMIN_TOKEN_EXPIRATION = '15m';
            expect(getTokenExpiration(true)).toBe('15m');
        });

        test('should return an empty string if ADMIN_TOKEN_EXPIRATION is set to ""', () => {
            // This is an edge case, but the logic correctly returns the value
            process.env.ADMIN_TOKEN_EXPIRATION = '';
            expect(getTokenExpiration(true)).toBe('');
        });
    });

    // --- Test Cases for Regular Customers ---
    describe('when user is a regular customer (isAdmin = false)', () => {

        test('should return undefined if CUSTOMER_TOKEN_EXPIRATION is not set', () => {
            // process.env.CUSTOMER_TOKEN_EXPIRATION is undefined
            expect(getTokenExpiration(false)).toBeUndefined();
        });

        test('should return the specific duration string if set (e.g., "2h")', () => {
            process.env.CUSTOMER_TOKEN_EXPIRATION = '2h';
            expect(getTokenExpiration(false)).toBe('2h');
        });

        test('should return the string "null" if CUSTOMER_TOKEN_EXPIRATION is set to "null"', () => {
            process.env.CUSTOMER_TOKEN_EXPIRATION = 'null';
            expect(getTokenExpiration(false)).toBe('null');
        });

        test('should return undefined when called with no arguments (defaults to customer)', () => {
            // This also tests that (isAdmin = false) is the default
            expect(getTokenExpiration()).toBeUndefined();
        });
    });
});
