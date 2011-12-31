var settings = require('./settings');

var twitter = require('ntwitter');

var twit = new twitter(settings.twitter);

exports.tweet = function (msg, callback) {
  console.log("Sending tweet: "+ msg);
  twit.updateStatus(msg, function () {
    if (callback) {
      callback.apply(null, Array.prototype.slice.call(arguments));
    }
  });
};