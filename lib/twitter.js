var settings = require('./settings');

var twitter = require('ntwitter');

var twit = new twitter(settings.twitter);

exports.tweet = function (msg) {
  twit.updateStatus(msg, function () {});
};