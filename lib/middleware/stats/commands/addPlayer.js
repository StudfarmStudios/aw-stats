var stats = require('../../../stats');

exports = module.exports = function () {
  return function (data, client, next) {
    var pilot = data._pilot;
    if (pilot) {
      if (client.pilots === undefined) {
        client.pilots = {};
      }

      if (client.tokens === undefined) {
        client.tokens = {};
      }
      client.tokens[data.AddPlayer] = pilot._id;
      client.pilots[pilot._id] = {started: new Date(), token: data.AddPlayer,  _id: pilot._id, username: pilot.username, rating: pilot.rating || 1500, currentRound: {score:0, shots:{total:0, weapons:{}}, kills: {total:0, pilots:{}}, deaths: {total:0, pilots:{}}, suicides: {total:0}}};
      console.log("Player added");
      console.log(client.pilots[pilot._id]);
      client.send({PlayerDetails: data.AddPlayer, Rating: pilot.rating});
    }
    next();
  };
};