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
    const decoded = jwt.verify(token, secret);
    req.token = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(400).send("Invalid Token");
  }
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

module.exports = { authenticate, signToken };
