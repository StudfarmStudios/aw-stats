# Example setup

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

# Example request and responses
        $ printf "test|kissa|koira|123\r\n" |nc -n 127.0.0.1 3000
        123|ERR|channel test doesn't exist

        $ printf "foobar1|kissa|koira|123\r\n" |nc -n 127.0.0.1 3000
        123|OK|foo=kissa, bar=koira

        $ printf "foobar2|kissa|koira|123\r\n" |nc -n 127.0.0.1 3000
        123|OK|foo|kissa|bar|koira

        $ printf "foobar3|kissa|koira|123\r\n" |nc -n 127.0.0.1 3000
        123|ERR|this fails

        $ printf "foobar4|kissa|koira|123\r\n" |nc -n 127.0.0.1 3000
        123|OK

        $ printf "foobar4|kissa|koira|koira2|123\r\n" |nc -n 127.0.0.1 3000
        123|ERR|invalid amount of values, should be 2 + id (optional)