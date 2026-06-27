/**
 * Global Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Determine status code: use status code from error if provided, default to 500
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Extract validation error messages
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ') || err.message;
  }

  // Respond with formatted JSON payload
  return res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
