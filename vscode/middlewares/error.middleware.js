const errorMiddleware = (error, req, res, next) => {
  res.statusCode = res.statusCode || 500;
  res.message = res.message || "something went wrong";

  return res.status(res.statusCode).json({
    success: false,
    message: res.message,
    stack: error.stack,
  });
};

export default errorMiddleware;
