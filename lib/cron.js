var utils = require('./utils');
var irc = require('./irc');
var twitter = require('./twitter');
var settings = require('./settings');
var repositories = require('./lib/repositories');

var schedule = function (time, callback) {
  var t = setTimeout(callback, time.getTime() - (new Date()).getTime());
  return {
    cancel: function () {
      clearTimeout(t);
    }
  }
};

// GAME STARTS MESSAGES

var gameStartsNow = "Battle starts now!";
var gameStartsInFiveMinutes = "5 mins to battle!";
var gameStartsInHalfHour = "The next scheduled battle starts in 30 minutes. See you there!";
var gameStartsInHour = "The next scheduled battle starts in 1 hour. See you there!";

function nextGameInformer() {
  utils.getNextGame(function (err, date) {
    if (date.getTime() > (new Date()).getTime()) {
      console.log("new game starts " + date);
      var halfHourBefore = new Date(date.getTime() - (3600000 / 2));
      var hourBefore = new Date(date.getTime() - 3600000);
      var fiveMinutesBefore = new Date(date.getTime() - 300000);
      var now = schedule(date, function() {
        irc.say(gameStartsNow);
        twitter.tweet(gameStartsNow);

        setTimeout(function () {
          nextGameInformer();
        }, 3600000);
      });

      var five = schedule(fiveMinutesBefore, function() {
        irc.say(gameStartsInFiveMinutes);
        twitter.tweet(gameStartsInFiveMinutes);
      });

      var halfHour = schedule(halfHourBefore, function() {
        irc.say(gameStartsInHalfHour);
        twitter.tweet(gameStartsInHalfHour);
      });

      var hour = schedule(hourBefore, function() {
        irc.say(gameStartsInHour);
        twitter.tweet(gameStartsInHour);
      });

    } else {
      setTimeout(function () {
        nextGameInformer();
      }, 3600000);
    }
  });
}
nextGameInformer();

// Daily news feed

function dailyNewsFeed() {
  //var d

}
dailyNewsFeed();

// Weekly news feed