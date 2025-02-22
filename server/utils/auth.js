const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const expiration = "2h";

/**
 * Middleware to authenticate JWT tokens in incoming requests.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
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
 * Generates a JWT token with user data.
 * @param {Object} user - The user object containing necessary data.
 * @param {string} user.phone - The user's phone number.
 * @param {string} user.id - The user's unique identifier.
 * @param {string} user.name - The user's name.
 * @param {boolean} user.admin - Whether the user has admin privileges.
 * @returns {string} - A signed JWT token.
 */
const signToken = ({ phone, id, name, admin }) => {
  const payload = { phone, id, name, admin };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

module.exports = { authenticate, signToken };
