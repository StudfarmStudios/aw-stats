var Round = require('../../../model/round');

exports = module.exports = function () {
  return function (data, client, next) {
    if (client.round == undefined) {
      client.round = new Round(data.Arena, client);
    } else {
      client.round.newRound(data.Arena);
    }
    next();
  }
};
