exports = module.exports = function () {
  return function (data, client, next) {
    if (client.round) {
      client.round.roundFinished(data.ArenaFinished);
    }
    next();
  }
};
