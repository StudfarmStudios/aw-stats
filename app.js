var server = require('./lib/server').createServer({port: 3000, httpPort: 3001});

server.register('foobar1',
    ['foo', 'bar'],
    function (data, client, next){
      client.send('foo='+data.foo+", bar="+data.bar);
      next();
});

server.register('foobar2',
    ['foo', 'bar'],
    function (data, client, next){
      client.send(['foo', data.foo, 'bar', data.bar]);
      next();
});

server.register('foobar3',
    ['foo', 'bar'],
    function (data, client, next){
      next(new Error('this fails'));
});

server.register('foobar4',
    ['foo', 'bar'],
    function (data, client, next){
      next();
});

server.listen(function () {
  console.log('Server started');
});