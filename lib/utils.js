exports.isValidObjectId = function (id) {
  var pattern = /^[0-9a-fA-F]{24}$/;
  return pattern.test(id);
};
