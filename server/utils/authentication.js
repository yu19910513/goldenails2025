const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const expiration = "2h";

/**
 * Middleware to authenticate requests using a JSON Web Token (JWT).
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} req.headers - Request headers.
 * @param {string} [req.headers.authorization] - Authorization header containing the JWT.
 * @param {Object} res - Express response object.
 * @param {Function} next - Callback to pass control to the next middleware.
 * @returns {void} Sends a 401 response if no token is provided, or a 400 response if the token is invalid.
 */
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Access Denied");
  }
  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    req.token = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(400).send("Invalid Token");
  }
};

/**
 * Middleware to restrict access based on the request's Referer header.
 * 
 * Allowed referrers are defined in the `ALLOWED_REFERRERS` environment variable as a comma-separated list.
 * If the Referer header is missing or does not match any allowed referrer, the request is denied with a 403 error.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * 
 * @returns {void} Calls `next()` if the Referer is authorized, otherwise responds with a 403 error.
 */
const basic_auth = (req, res, next) => {
  const allowedReferrers = process.env.ALLOWED_REFERRERS
    ? process.env.ALLOWED_REFERRERS.split(',')
    : [];
    console.log(req.get('Referer'));
    
  const referer = (req.get('Referer') || '').toLowerCase();

  if (!allowedReferrers.some((allowed) => referer.startsWith(allowed))) {
    return res.status(403).json({ error: 'Unauthorized referrer' });
  }
  next();
};

/**
 * Generates a JSON Web Token (JWT) for authentication.
 * @function
 * @param {Object} payload - The data to be embedded in the token.
 * @returns {string} The signed JWT token.
 */
const signToken = (payload) => {
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

module.exports = { authenticate, signToken, basic_auth };
