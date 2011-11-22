# Example setup

        var server = require('./lib/server').createServer({port: 3000, httpPort: 3001});

        server.register({bar: 'foo'},
            function (data, client, next){
              client.send({data: 'I received bar : foo'});
              next();
        });

        server.register({kills: {$gt:5}},
            function (data, client, next){
              client.send("Kills where greater than 5");
              next();
        });

        server.register({echo: {'$exists':true}},
            function (data, client, next){
              client.send(data.echo);
              next();
        });

        server.listen(function () {
          console.log('Server started');
        });

# Example request and responses
        $ printf '{"bar":"foo"}\r\n' |nc -n 127.0.0.1 3000
        {"data":"I received bar : foo"}

        $ printf '{"kills":6}\r\n' |nc -n 127.0.0.1 3000
        "Kills where greater than 5"

        $ printf '{"echo":"this will be echoed"}\r\n' |nc -n 127.0.0.1 3000
        "this will be echoed"