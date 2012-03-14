var server = require('./lib/masterserver').createMasterServer({port: 3003});

server.register('joinserver', function (req, res) {
  res.send({foo: 'bar'});
});

server.listen();