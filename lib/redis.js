var settings = require('./settings');
var redis = require('redis');
r = redis.createClient();
r.select(settings.redisDb, function (err) {
  if (err) {
    console.log(err);
    console.log(err.stack);
  }
});

exports = module.exports = r;