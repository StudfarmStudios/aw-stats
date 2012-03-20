exports.mongodb = {host: 'localhost', port: 27017, collection: 'assaultwing'};
exports.irc = {host: 'irc.atw-inter.net', nick: 'aw-bot', channel: '#battlefront' };
exports.redisDb = 0;

exports.twitter = {
      consumer_key: '',
      consumer_secret: '',
      access_token_key: '',
      access_token_secret: ''
  };

exports.masterServerPort = 16727;
exports.statsPort = 3000;
exports.httpPort = 3001;
exports.httpsPort = 3002;

if (process.env.NODE_ENV == 'development') {
  exports.mongodb = {host: 'localhost', port: 27017, collection: 'assaultwing-dev'};
  exports.irc = {host: 'irc.fu-berlin.de', nick: 'aw-bot-dev', channel: '#aw-gbf' };
  exports.redisDb = 1;

  exports.masterServerPort = 16728;

  exports.statsPort = 4000;
  exports.httpPort = 4001;
  exports.httpsPort = 4002;

  exports.twitter = {
      consumer_key: '',
      consumer_secret: '',
      access_token_key: '',
      access_token_secret: ''
  };
}