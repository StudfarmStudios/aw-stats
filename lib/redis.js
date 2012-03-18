var redis = require('redis');
r = redis.createClient();

exports = module.exports = r;