// error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log to console for dev
  console.log(err.stack.red);
  const statusCode = err.statusCode || 400;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack, // only show stack in development mode
  });
};

// invalid path error handler middleware
const notFound = (req, res, next) => {
  let error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404; 
  next(error);
};

export { errorHandler, notFound };
