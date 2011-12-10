var arena = require('../arena');
var kill = require('../kill');
var ObjectId = require('mongodb').BSONPure.ObjectID;

module.exports = {
  "test first arena call" : function (test) {
    var token1 = (new ObjectId()).toString();
    var token2 = (new ObjectId()).toString();
    var token3 = (new ObjectId()).toString();

    var middleware = arena();
    var client = {send:function(data){
      test.equals(data.Rating, 1500);
    },
    tokens: {}, pilots: {}};
    client.tokens[token1] = (new ObjectId()).toString();
    client.tokens[token2] = (new ObjectId()).toString();
    client.tokens[token3] = (new ObjectId()).toString();
    
    client.pilots[client.tokens[token1]] = {_id: client.tokens[token1], username: "foobar1", rating: 1500};
    client.pilots[client.tokens[token2]] = {_id: client.tokens[token2], username: "foobar2", rating: 1500};
    client.pilots[client.tokens[token3]] = {_id: client.tokens[token3], username: "foobar3", rating: 1500};

    middleware({Arena: "fooarena", Players:[token1, token2, token3]}, client, function (err) {
      test.ok(!err);
      test.equals(client.arena, 'fooarena');
      test.ok(client.roundId);
      test.ok(client.roundStarted);
      var i = 0;
      for (var id in client.pilots) {
        i++;
        test.equals(JSON.stringify(client.pilots[id].currentRound), JSON.stringify({ score: 0,
            shots: { total: 0, weapons: {} },
            kills: { total: 0, pilots: {} },
            deaths: { total: 0, pilots: {} },
            suicides: { total: 0 } }));
      }
      test.equals(i, 3);
      test.done();
    });

  },
  "test 2 arena calls and kill between" : function (test) {
    var token1 = (new ObjectId()).toString();
    var token2 = (new ObjectId()).toString();
    var token3 = (new ObjectId()).toString();

    var middleware = arena();
    var client = {send:function(data){
     console.log(data);
    },
    tokens: {}, pilots: {}};
    client.tokens[token1] = (new ObjectId()).toString();
    client.tokens[token2] = (new ObjectId()).toString();
    client.tokens[token3] = (new ObjectId()).toString();

    client.pilots[client.tokens[token1]] = {_id: client.tokens[token1], token: token1, username: "foobar1", rating: 1500};
    client.pilots[client.tokens[token2]] = {_id: client.tokens[token2], token: token2, username: "foobar2", rating: 1500};
    client.pilots[client.tokens[token3]] = {_id: client.tokens[token3], token: token3, username: "foobar3", rating: 1500};

    middleware({Arena: "fooarena", Players:[token1, token2, token3]}, client, function (err) {
      test.ok(!err);
      test.equals(client.arena, 'fooarena');
      test.ok(client.roundId);
      test.ok(client.roundStarted);
      var i = 0;
      for (var id in client.pilots) {
        i++;
        test.equals(JSON.stringify(client.pilots[id].currentRound), JSON.stringify({ score: 0,
            shots: { total: 0, weapons: {} },
            kills: { total: 0, pilots: {} },
            deaths: { total: 0, pilots: {} },
            suicides: { total: 0 } }));
      }
      test.equals(i, 3);
    });

    var killMiddleware = kill();
    killMiddleware({Killer: token1, Victim: token2, _killer: client.pilots[client.tokens[token1]], _victim: client.pilots[client.tokens[token2]]}, client, function () {

    });

    killMiddleware({Killer: token1, Victim: token2, _killer: client.pilots[client.tokens[token1]], _victim: client.pilots[client.tokens[token2]]}, client, function () {

    });

    killMiddleware({Killer: token1, Victim: token2, _killer: client.pilots[client.tokens[token1]], _victim: client.pilots[client.tokens[token2]]}, client, function () {

    });

    killMiddleware({Killer: token1, Victim: token2, _killer: client.pilots[client.tokens[token1]], _victim: client.pilots[client.tokens[token2]]}, client, function () {

    });

    killMiddleware({Killer: token1, Victim: token2, _killer: client.pilots[client.tokens[token1]], _victim: client.pilots[client.tokens[token2]]}, client, function () {

    });

    killMiddleware({Killer: token1, Victim: token2, _killer: client.pilots[client.tokens[token1]], _victim: client.pilots[client.tokens[token2]]}, client, function () {

    });

    killMiddleware({Killer: token1, Victim: token2, _killer: client.pilots[client.tokens[token1]], _victim: client.pilots[client.tokens[token2]]}, client, function () {

    });

    killMiddleware({Killer: token1, Victim: token2, _killer: client.pilots[client.tokens[token1]], _victim: client.pilots[client.tokens[token2]]}, client, function () {

    });

    killMiddleware({Killer: token1, Victim: token2, _killer: client.pilots[client.tokens[token1]], _victim: client.pilots[client.tokens[token2]]}, client, function () {

    });

    killMiddleware({Killer: token1, Victim: token2, _killer: client.pilots[client.tokens[token1]], _victim: client.pilots[client.tokens[token2]]}, client, function () {

    });

    middleware({Arena: "fooarena", Players:[token1, token2, token3]}, client, function (err) {
      test.ok(!err);
      test.equals(client.arena, 'fooarena');
      test.ok(client.roundId);
      test.ok(client.roundStarted);
      var i = 0;
      for (var id in client.pilots) {
        i++;
        test.equals(JSON.stringify(client.pilots[id].currentRound), JSON.stringify({ score: 0,
            shots: { total: 0, weapons: {} },
            kills: { total: 0, pilots: {} },
            deaths: { total: 0, pilots: {} },
            suicides: { total: 0 } }));
      }
      test.equals(i, 3);

      test.ok(client.pilots[client.tokens[token1]].rating > 1500);
      test.ok(client.pilots[client.tokens[token2]].rating < 1500);
      test.ok(client.pilots[client.tokens[token3]].rating > 1500);
      test.ok(client.pilots[client.tokens[token3]].rating < client.pilots[client.tokens[token1]].rating);

      test.done();
    });

  }
};