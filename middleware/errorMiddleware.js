// Unsupported 404 routes

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error Middleware

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    // Corrected syntax for checking if headers are sent
    return next(error);
  }

  res
    .status(error.code || 500)
    .json({ message: error.message || "Internal Server Error" });
};

module.exports = { notFound, errorHandler };
