var stats = require('../../../stats');

exports = module.exports = function () {
  return function(data, client, next) {
    var pilot = data._pilot;
    var type = data.Type;

    if (pilot) {
      pilot.shot(type, data._pos);
    }

  };
};