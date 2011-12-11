var stats = require('../../../stats');

exports = module.exports = function () {
  return function(data, client, next) {
    var victim = data._victim;

    if (victim) {
      victim.suicide();
    }

    next();
  };
};