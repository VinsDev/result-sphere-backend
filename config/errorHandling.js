// Utility function to format errors
const formatError = (err) => {
    if (err.errors) {
      return err.errors.map(error => ({
        message: error.message,
        field: error.path
      }));
    }
    return [{ message: err.message }];
  };
  
  module.exports = {
    formatError,
  };
  