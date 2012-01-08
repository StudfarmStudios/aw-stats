var utils = require('./utils');
var irc = require('./irc');
var twitter = require('./twitter');
var settings = require('./settings');
var repositories = require('./repositories');

var schedule = function (time, callback) {
  var time = time.getTime() - (new Date()).getTime();
  if (time < 0) {
    return;
  }
  var t = setTimeout(callback, time);
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
  var now = new Date();
  //var date = new Date(now.getTime() - (now.getTime() % 86400000) - (86400000 * 1.5));
  var date = new Date(now.getTime() - (now.getTime() % 86400000) - (86400000 / 2));
  repositories.round.getRoundsByDate(date, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }

    if(data.length === 0) {
      console.log("It seems no rounds where found");
      return;
    }

    var pilots = [];
    var getPilot = function (username) {
      var i;
      for (i = 0; i < pilots.length; i++) {
        if (pilots[i].username === username) {
          return pilots[i];
        }
      }

      var pilot = {
            username: username,
            score: 0,
            kills: 0,
            deaths: 0,
            suicides: 0,
            playTime: 0,
            wins: 0,
            rounds: 0
          };

      pilots.push(pilot);

      return pilot;
    };
    var rounds = data.length;
    var first;
    data.forEach(function (round) {
      first = true;
      round.results.forEach(function (result) {
        var pilot = getPilot(result.username);
        if (pilot.oldRating == null) {
          pilot.oldRating = result.oldRating
        }
        pilot.newRating = result.newRating;
        pilot.score += result.score;
        pilot.kills += result.kills;
        pilot.deaths += result.deaths;
        pilot.suicides += result.suicides;
        pilot.playTime += result.playTime;
        pilot.rounds++;

        if (first) {
          pilot.wins++;
          first = false;
        }

      });
    });

    var bestRatingDelta = {username: null, delta: 0};
    var bestTotalScore = {username: null, score: 0};
    var bestTotalKills = {username: null, kills: 0};
    var bestTotalWins = {username: null, wins: 0};
    var bestTotalRounds = {username: null, rounds: 0};
    var bestPlayTime = {username: null, playTime: 0};
    var totalPlayTime = 0;

    var ratingDelta;
    pilots.forEach(function (pilot) {
      ratingDelta = pilot.newRating - pilot.oldRating;
      if (bestRatingDelta.username == null || bestRatingDelta.delta < ratingDelta) {
        bestRatingDelta.username = pilot.username;
        bestRatingDelta.delta = ratingDelta;
        bestRatingDelta.oldRating = pilot.oldRating;
        bestRatingDelta.newRating = pilot.newRating;
      }

      if (bestTotalScore.username == null || bestTotalScore.score < pilot.score) {
        bestTotalScore.username = pilot.username;
        bestTotalScore.score = pilot.score;
      }

      if (bestTotalKills.username == null || bestTotalKills.kills < pilot.kills) {
        bestTotalKills.username = pilot.username;
        bestTotalKills.kills = pilot.kills;
      }

      if (bestTotalWins.username == null || bestTotalWins.wins < pilot.wins) {
        bestTotalWins.username = pilot.username;
        bestTotalWins.wins = pilot.wins;
      }

      if (bestTotalRounds.username == null || bestTotalRounds.rounds < pilot.rounds) {
        bestTotalRounds.username = pilot.username;
        bestTotalRounds.rounds = pilot.rounds;
      }

      if (bestPlayTime.username == null || bestPlayTime.playTime < pilot.playTime) {
        bestPlayTime.username = pilot.username;
        bestPlayTime.playTime = pilot.playTime;
      }

      totalPlayTime += pilot.playTime;
    });

    console.log("Rating delta " + JSON.stringify(bestRatingDelta));
    console.log("Total score " + JSON.stringify(bestTotalScore));
    console.log("Total kills " + JSON.stringify(bestTotalKills));
    console.log("Best flight time " + JSON.stringify(bestPlayTime));
    console.log("Total playtime " + JSON.stringify(totalPlayTime));
    console.log("Total wins " + JSON.stringify(bestTotalWins));
    console.log("Total rounds " + JSON.stringify(bestTotalRounds));
    
    var message = "A total of " + rounds + " arenas were played yesterday. " + utils.capitaliseFirstLetter(bestTotalWins.username) +" won " + bestTotalWins.wins + " of them.";

    if (bestRatingDelta.delta > 35) {
      message += " " + utils.capitaliseFirstLetter(bestTotalWins.username) + " improved his rating from "+ Math.floor(bestRatingDelta.oldRating) +" to "+ Math.floor(bestRatingDelta.newRating) +"."
    }

    console.log(message);
    console.log(message.length);
    twitter.tweet(message);

  });

  var nextTime = new Date(now.getTime()  + 86400000);
  console.log("Daily feed well be processed next time " + nextTime);
  schedule(nextTime, dailyNewsFeed);
}
var now = new Date();
var nextTime = new Date(now.getTime() - (now.getTime() % 86400000) + 86400000 + 300000);
console.log("Daily feed well be processed next time " + nextTime);
schedule(nextTime, dailyNewsFeed);
//schedule(new Date(), dailyNewsFeed);

// Weekly news feed