const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const expiration = "2h";

/**
 * Middleware to authenticate a user via JWT.
 * 
 * This function checks for a JWT in the `Authorization` header of the request.
 * If present, it verifies the token using the secret key defined in environment variables.
 * On successful verification, it attaches the decoded user data to `req.user`.
 * If the token is missing, invalid, or expired, it responds with an appropriate HTTP status.
 *
 * @function authenticateUser
 * @param {Object} req - Express request object, expected to have an `Authorization` header.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * 
 * @returns {void} - Calls `next()` if authentication succeeds, otherwise sends a 401 or 400 response.
 */
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Access Denied");
  }
  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    req.user = decoded.data;
    next();
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
};


/**
 * Middleware to authorize admin users via JWT.
 * 
 * This function checks for a JWT in the `Authorization` header,
 * verifies it using the secret key, and ensures that the decoded
 * payload includes `admin_privilege: true`. It is intended to be
 * used on routes that require administrative privileges.
 *
 * If the token is missing, expired, invalid, or does not indicate admin access,
 * the middleware responds with a relevant HTTP status and message.
 *
 * @function authorizeAdmin
 * @param {Object} req - Express request object, expected to contain a JWT in the `Authorization` header.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * 
 * @returns {void} - Calls `next()` if the user is authorized as an admin,
 * otherwise sends a 401 or 403 response.
 */
const authorizeAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Access Denied: No token provided");
  }

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret); // This will throw if expired

    // Check if admin_privilege is true
    if (decoded?.data?.admin_privilege === true) {
      req.user = decoded.data;
      next(); // Access granted
    } else {
      return res.status(403).send("Access Denied: Admins only");
    }

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }

    return res.status(403).json({ error: 'Invalid token or unauthorized access' });
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

module.exports = { authenticateUser, authorizeAdmin, signToken, basic_auth };
