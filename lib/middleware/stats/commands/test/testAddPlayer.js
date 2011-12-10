var addPlayer = require('../addPlayer');

module.exports = {
  "test add player" : function (test) {
    var middleware = addPlayer();
    var client = {send: function (data) {
      test.equals(JSON.stringify(data), JSON.stringify({ PlayerDetails: 'foobar', Rating: 2100 }));
    }};
    middleware({AddPlayer: 'foobar', _pilot: {_id: 'fooid', username: 'foousername', rating: 2100}}, client, function (err) {
          test.ok(!err);
          test.ok(client.tokens['foobar']);
          test.ok(client.pilots['fooid']);
          test.equals(client.pilots['fooid'].rating, 2100);
          test.equals(client.pilots['fooid'].username, 'foousername');
          test.equals(client.pilots['fooid']._id, 'fooid');
          test.equals(JSON.stringify(client.pilots['fooid'].currentRound), JSON.stringify({ score: 0,
            shots: { total: 0, weapons: {} },
            kills: { total: 0, pilots: {} },
            deaths: { total: 0, pilots: {} },
            suicides: { total: 0 } }));
          test.done();
        });
  }
};