const jwt = require("jsonwebtoken");
const HttpError = require("../models/errorModel");

// Middleware function to check for authorization token
const authMiddleware = async (req, res, next) => {
  // Check if the authorization header exists and starts with "Bearer" (standard format)
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer")) {
    return next(new HttpError("Unauthorized: No token provided", 403));
  }

  // Extract the token from the "Bearer" prefix
  const token = authorizationHeader.split(" ")[1]; // Split on space and get the second element

  try {
    // Verify the token using JWT library and the secret key from environment variable
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // If token is valid, attach the decoded user information to the request object
    req.user = decoded; // Store decoded user data (e.g., user ID) in the request object
    next();
  } catch (err) {
    // Handle errors during token verification
    return next(new HttpError("Unauthorized: Invalid token", 403));
  }
};

module.exports = authMiddleware;
