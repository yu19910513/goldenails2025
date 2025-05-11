const { authenticateUser, authorizeAdmin, basic_auth } = require('../utils/authentication'); // Update with the correct path
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test_secret';
const secret = process.env.JWT_SECRET;
jest.mock('jsonwebtoken');

describe('authenticateUser middleware', () => {
    const secret = process.env.JWT_SECRET || 'your_secret'; // Use the secret key
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };
    const mockNext = jest.fn();

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should return 401 if no token is provided', () => {
        const req = { headers: {} };
        const res = mockResponse();
        authenticateUser(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Access Denied');
    });

    it('should call next if token is valid', () => {
        const validToken = jwt.sign({ data: 'test' }, secret, { expiresIn: '2h' });
        const req = { headers: { authorization: `Bearer ${validToken}` } };
        const res = mockResponse();

        // Mock jwt.verify to return a valid token
        jwt.verify = jest.fn().mockReturnValue({ data: 'test' });

        authenticateUser(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(jwt.verify).toHaveBeenCalledWith(validToken, secret); // Ensure the correct token and secret are passed
    });

    it('should return 400 if token is invalid', () => {
        const invalidToken = 'invalid_token';
        const req = { headers: { authorization: `Bearer ${invalidToken}` } };
        const res = mockResponse();

        // Mock jwt.verify to throw an error for an invalid token
        jwt.verify = jest.fn().mockImplementation(() => {
            throw new Error('Invalid Token');
        });

        authenticateUser(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Invalid Token');
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
