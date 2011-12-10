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
    }


    next();
  };
};