var utils = require('../utils');

module.exports = {
  "valid mongo id" : function (test) {
    var ObjectId = require('mongodb').BSONPure.ObjectID;
    var mongoId = (new ObjectId()).toString();

    test.ok(utils.isValidObjectId(mongoId));
    test.ok(!utils.isValidObjectId("FOOBAR"));
    test.done();
  },
  "test calculate new rating with winning one other pilot" : function (test) {

    var pilot = {rating: 1600, currentRound:{score: 11}};

    var pilots = {};
    pilots[0] = {rating: 2000, currentRound:{score: 10}};

    var newRating = utils.calculateNewRating(pilot, pilots);
    
    test.ok(newRating > pilot.rating);

    test.done();
  },
  "test calculate new rating with losing one other pilot" : function (test) {
    var pilot = {rating: 2001, currentRound:{score:  9}};
    var pilots = {};
    pilots[0] = {rating: 2000, currentRound:{score:  10}};
    var newRating = utils.calculateNewRating(pilot, pilots);
    test.ok(newRating < pilot.rating);
    test.done();
  },
  "test calculate new rating with multiple pilots" : function (test) {
    var pilot = {rating: 1600, currentRound:{score:11}};
    var pilots = {};
    pilots[1] = {rating: 1400, currentRound:{score:5}};
    pilots[2] = {rating: 2410, currentRound:{score:6}};
    pilots[3] = {rating: 2700, currentRound:{score:7}};
    pilots[4] = {rating: 1300, currentRound:{score:8}};
    pilots[5] = {rating: 1900, currentRound:{score:12}};
    pilots[6] = {rating: 1700, currentRound:{score:1}};
    pilots[7] = {rating: 1700, currentRound:{score:2}};
    var newRating = utils.calculateNewRating(pilot, pilots);
    test.ok(newRating > pilot.rating);
    test.done();
  },
  "test calculate new rating with zero other pilots" : function (test) {
    var pilot = {rating: 1600, currentRound:{score:11}};
    var pilots = {};
    var newRating = utils.calculateNewRating(pilot, pilots);
    test.equals(newRating, pilot.rating);
    test.done();
  }
};