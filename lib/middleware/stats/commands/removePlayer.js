var stats = require('../../../stats');

exports = module.exports = function () {
  return function (data, client, next) {
    var pilot = data._pilot;
    if (pilot) {
      pilot.leave();
    }
    next();
  };
};