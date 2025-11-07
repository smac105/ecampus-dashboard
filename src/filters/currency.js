module.exports = function(value) {
  return `$${parseFloat(value).toFixed(2)}`;
};