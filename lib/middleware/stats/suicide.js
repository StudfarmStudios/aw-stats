var stats = require('../../stats');

exports = module.exports = function () {
  return function(data, client, next) {
    var victim = (data._victim && data._victim._id) ? data._victim._id : null;

    stats.suicide(victim, client.arena);
    next();
  };
};