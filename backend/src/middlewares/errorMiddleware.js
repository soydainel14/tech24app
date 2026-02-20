/*
 * Centralized error handler. Express will pass errors here for any
 * route that calls next(err). The response includes a status code
 * and a JSON body with a message. In production, avoid leaking
 * sensitive information.
 */
function errorHandler(err, req, res, next) {
  console.error(err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
}

module.exports = { errorHandler };