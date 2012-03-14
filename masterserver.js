var middlewares = require('./lib/middleware/master');

var server = require('./lib/masterserver').createMasterServer({port: 3003});

server.register('addserver', middlewares.add());
server.register('joinserver', middlewares.join());
server.register('removeserver', middlewares.remove());
server.register('updateserver', middlewares.update());
server.register('listservers', middlewares.list(true));

server.listen();