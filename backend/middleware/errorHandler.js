const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Centralized error handler. Every controller funnels errors here via asyncHandler/next(err).
function errorHandler(err, req, res, next) {
  let { statusCode, message, details } = err;

  if (!statusCode) {
    if (err.code === 'ER_DUP_ENTRY') {
      statusCode = 409;
      message = 'A record with this value already exists';
    } else if (err.name === 'ValidationError') {
      statusCode = 400;
      message = err.message;
    } else if (err instanceof ApiError === false) {
      statusCode = 500;
      message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
    }
  }

  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode || 500).json({
    success: false,
    message: message || 'Internal server error',
    ...(details ? { details } : {}),
  });
}

module.exports = { notFound, errorHandler };
