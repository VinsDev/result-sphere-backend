const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack); // Log the error details
    res.status(err.status || 500).json({
        message: err.message || 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err : {} // Provide stack trace only in development
    });
};

module.exports = errorMiddleware;
