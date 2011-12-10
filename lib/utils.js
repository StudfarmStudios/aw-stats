exports.isValidObjectId = function (id) {
  var pattern = /^[0-9a-fA-F]{24}$/;
  return pattern.test(id);
};

exports.calculateNewRating = function (pilot, pilots) {
  function getExpectedResult(opponent) {
    return 1 / (1 + 10 ^ ((pilot.rating - opponent.rating) / 400 ));
  }

  function getResult(opponent) {
    if (opponent.currentRound.score > pilot.currentRound.score) {
      return 0;
    } else if (opponent.currentRound.score === pilot.currentRound.score) {
      return 0.5;
    } else {
      return 1;
    }
  }

  var expected = 0;
  var actual = 0;
  for (var id in pilots) {
    var opponent = pilots[id];
    if (opponent == pilot) {
      continue;
    }

    expected += getExpectedResult(opponent);
    actual += getResult(opponent);
  }

  var rating = pilot.rating;

  var k = 16;
  if (rating < 2100) {
    k = 32;
  } else if (rating > 2100 && rating < 2400) {
    k = 24;
  }

  var newRating = rating + k * (actual - expected);

  return newRating;
};
