// Utility function to format dates
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US');
  };
  
  module.exports = {
    formatDate,
  };
  