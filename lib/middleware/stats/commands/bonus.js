var stats = require('../../../stats');

exports = module.exports = function () {
  return function(data, client, next) {
    var pilot = (data._pilot && data._pilot._id) ? data._pilot._id : null;
    var bonus = data.Bonus;
    var arena = client.arena;
    var roundId = client.roundId;
    stats.bonus(pilot, bonus, arena, roundId);
    next();
  };
};