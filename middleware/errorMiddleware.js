// Unsupported 404 routes

const notFound = (req, res, next) => {
  // Handle requests to non-existent routes

  const error = new Error(`Not Found - ${req.originalUrl}`);  // Create a new error object
  res.status(404);  // Set the response status to 404 (Not Found)
  next(error);  // Pass the error object to the next middleware (error handler)
};

// Error Middleware

const errorHandler = (error, req, res, next) => {
  // Handle errors thrown throughout the application
  if (res.headersSent) {
    // Corrected syntax: Check if headers have already been sent
    return next(error); // If headers are sent, don't modify the response (pass error on)
  }

  res
    .status(error.code || 500)  // Set the response status code (from error object or default to 500)
    .json({ message: error.message || "Internal Server Error" });  // Send an error response with message
};

module.exports = { notFound, errorHandler };
