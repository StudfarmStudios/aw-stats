var stats = require('../../../stats');

exports = module.exports = function () {
  return function (data, client, next) {
    var pilot = data._pilot;
    if (pilot) {
      if (pilot.started) {
        var now = new Date();
        var playTime = now.getTime() - pilot.started.getTime();
        var hours = playTime / ( 1000 * 60 * 60 );
        stats.updatePilot(pilot._id, {$inc: {playTime: hours}});
      }
      if (client.pilots) {
        client.pilots[pilot._id].currentRound.left = new Date();
      }
    }
    next();
  };
};