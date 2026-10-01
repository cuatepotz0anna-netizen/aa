const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  const response = {
    success: false,
    message: error.message || 'No se pudo realizar la operación',
  };

  if (process.env.NODE_ENV !== 'production') {
    response.error = error.stack || error.message;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
