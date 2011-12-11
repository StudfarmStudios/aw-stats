var stats = require('../../../stats');

exports = module.exports = function () {
  return function (data, client, next) {
    var pilot = data._pilot;
    if (pilot) {
      if (client.pilots) {
        client.pilots[pilot._id].currentRound.left = new Date();
      }
    }
    next();
  };
};