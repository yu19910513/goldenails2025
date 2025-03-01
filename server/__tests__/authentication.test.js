const { authenticate, basic_auth } = require('../utils/authentication'); // Update with the correct path
const jwt = require('jsonwebtoken');

describe('authenticate', () => {
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };
    const mockNext = jest.fn();

    it('should return 401 if no token is provided', () => {
        const req = { headers: {} };
        const res = mockResponse();
        authenticate(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Access Denied');
    });

    it('should call next if token is valid', () => {
        const validToken = jwt.sign({ data: 'test' }, 'test_secret', { expiresIn: '2h' });
        const req = { headers: { authorization: `Bearer ${validToken}` } };
        const res = mockResponse();
        authenticate(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 if token is invalid', () => {
        const invalidToken = 'invalid_token';
        const req = { headers: { authorization: `Bearer ${invalidToken}` } };
        const res = mockResponse();
        authenticate(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Invalid Token');
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
