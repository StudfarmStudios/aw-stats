var server = require('./lib/server').createServer({port: 3000, httpPort: 3001});

server.register({bar: 'foo'},
    function (data, client, next) {
      client.send({data: 'I received bar : foo'});
      next();
    });

server.register({kills: {$gt:5}},
    function (data, client, next) {
      client.send("Kills where greater than 5");
      next();
    });

server.register({echo: {'$exists':true}},
    function (data, client, next) {
      client.send(data.echo);
      next();
    });

server.listen(function () {
  console.log('Server started');
});