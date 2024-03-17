const jwt = require("jsonwebtoken");
const HttpError = require("../models/errorModel");

// Middleware function to check for authorization token
const authMiddleware = (req, res, next) => {
  // Check if the authorization header exists and starts with "Bearer" (standard format)
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer")) {
    return next(new HttpError("Unauthorized: No token provided", 403));
  }

  // Extract the token from the "Bearer" prefix
  const token = authorizationHeader.split(" ")[1];  // Split on space and get the second element

  // Verify the token using JWT library and the secret key from environment variable
  jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
    if (err) {
      // Handle errors during token verification
      return next(new HttpError("Unauthorized: Invalid token", 403));
    }
    // If token is valid, attach the decoded user information to the request object
    req.user = info; // Store decoded user data (e.g., user ID) in the re
  });
};

module.exports = authMiddleware;
