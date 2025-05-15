const { authenticateUser, authorizeAdmin, basic_auth, signToken } = require('../utils/authentication'); // Update with the correct path
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test_secret';
const secret = process.env.JWT_SECRET;
jest.mock('jsonwebtoken');

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

    beforeEach(() => {
        process.env.JWT_SECRET = 'testsecret';
    });

    it('should call jwt.sign with correct arguments and return the token', () => {
        const mockToken = 'mock.jwt.token';
        jwt.sign.mockReturnValue(mockToken);

        const token = signToken(mockPayload);

        expect(jwt.sign).toHaveBeenCalledWith(
            { data: mockPayload },
            'testsecret',
            { expiresIn: '2h' }
        );
        expect(token).toBe(mockToken);
    });
});
