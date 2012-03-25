(function (window) {

  var content,
      id,
      round,
      scores,
      idToUsernameMap,
      kills;

  var contentHtml = document.getElementById('round-content-template').innerHTML;

  function constructRoundScoreList () {
    var posPerScore = {};
    var pos = 0;
    var i, result;
    for (i = 0; i < round.results.length; i++) {
      result = round.results[i];
      if (posPerScore[result.score] == null) {
        pos++;
        posPerScore[result.score] = pos;
      }
    }
    idToUsernameMap = {};
    $.each(round.results, function (indx, res) {
      if (res._id) {
        idToUsernameMap[res._id] = res.username;
      }

      if (!res.anon) {
        res.anon = false;
      }

      res.rating = Math.round(res.newRating - res.oldRating);
      res.position = posPerScore[res.score];
      var element = $(tmpl('round-score-template', res));
      scores.append(element);
    });

    constructKillInfoList();
  }

  function constructKillInfoList () {
    window.aw.stats.roundKills(id, function (data) {
      if (data.error != undefined) {
        return;
      }

      var killTable = $(tmpl('round-kill-template', {killData: {kassu:{kessu:1}, kessu:{kassu:0}}}));
      kills.append(killTable);
    });
  }

  function constructRoundInfoTable () {
    content.find('.arena').html(round.arena.name);
    content.find('.started').html(round.started);
    content.find('.ended').html(round.ended);
    var winners = "";
    var i, result;
    for (i = 0; i < round.results.length; i++) {
      result = round.results[i];
      if (result.score < round.results[0].score) {
        break;
      }

      if (i > 0) {
        winners += ', ';
      }
      if (result.anon) {
        winners += result.username + ' <span class="label notice">Not registered</span>';
      } else {
        winners += '<a href="#!/pilot/' + result.username + '">' + result.username + '</a>';
      }

    }
    content.find('.winner').html(winners);
  }

  var round = function (hash) {
    var parts = hash.split('/');
    id = parts.pop();
    content = $(contentHtml);
    scores = content.find('.result-table');

    $('.container .content').html(content);
    $('.page-header h1').html("Round <small>" + id + "</small>");
    window.aw.stats.round(id, function (data) {
      round = data;
      constructRoundInfoTable();
      constructRoundScoreList();
    });
  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  if (window.aw.ui.view == undefined) {
    window.aw.ui.view = {};
  }

  window.aw.ui.view.round = round;
})(window);