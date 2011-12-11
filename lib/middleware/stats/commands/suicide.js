var stats = require('../../../stats');

exports = module.exports = function () {
  return function(data, client, next) {
    var victim = (data._victim && data._victim._id) ? data._victim._id : null;

    stats.suicide(victim, client.arena, client.roundId);

    if (victim) {
      var pilot = client.pilots[victim];
      if (pilot && pilot.currentRound) {
        pilot.currentRound.score += -1;
        if (pilot.currentRound.suicide) {
          pilot.currentRound.suicide.total++;
        }
      }

      if (pilot && pilot.startedFlying) {
        var now = new Date();
        var playTime = now.getTime() - pilot.startedFlying.getTime();
        var hours = playTime / ( 1000 * 60 * 60 );
        stats.updatePilot(pilot._id, {$inc: {playTime: hours}});
      }

    }


    next();
  };
};