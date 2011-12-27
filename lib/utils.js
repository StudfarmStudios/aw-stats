exports.isValidObjectId = function (id) {
  var pattern = /^[0-9a-fA-F]{24}$/;
  return pattern.test(id);
};

exports.isValidPassword = function (password) {
  var pattern = /^\w*(?=\w*\d)(?=\w*[a-z])(?=\w*[A-Z])\w*$/;
  return pattern.test(password);
};
