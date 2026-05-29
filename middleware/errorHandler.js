module.exports = function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || error.status || 500;

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return res.status(409).json({
      message: `${field} is already in use.`
    });
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((item) => item.message);
    return res.status(400).json({
      message: messages[0] || "Validation failed."
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid resource identifier."
    });
  }

  res.status(statusCode).json({
    message:
      statusCode === 500
        ? "Something went wrong on the server."
        : error.message
  });
};
