(function (window) {

  var content,
      id,
      round,
      scores;

  var contentHtml = ''
        + '<div class="page-header">'
        + '  <h1></h1>'
        + '</div>'
        + '<div class="row"><div class="span2"><b>Arena</b></div><div class="span6 arena">Loading</div></div>'
        + '<div class="row"><div class="span2"><b>Started</b></div><div class="span6 started">Loading</div></div>'
        + '<div class="row"><div class="span2"><b>Ended</b></div><div class="span6 ended">Loading</div></div>'
        + '<div class="row"><div class="span2"><b>Winner(s)</b></div><div class="span6 winner">Loading</div></div>'
        + '<br /><h2>Results</h2>'
        + '<table>'
        + '  <thead><th>Pos.</th><th>Pilot</th><th>Kills</th><th>Deaths</th><th>Suicides</th><th>Score</th><th>Rating</th></thead>'
        + '  <tbody class="result-table"></tbody>'
        + '</table>'

      ;

  var scoreHtml = ''
        + '<tr>'
        + '  <td class="position"></td>'
        + '  <td class="username"></td>'
        + '  <td class="kills"></td>'
        + '  <td class="deaths"></td>'
        + '  <td class="suicides"></td>'
        + '  <td class="score"></td>'
        + '  <td class="rating"></td>'
        + '</tr>';

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

    $.each(round.results, function (indx, res) {
      var element = $(scoreHtml);
      if (res.anon) {
        element.find('.username').html(res.username + ' <span class="label notice">Not registered</span>');
      } else {
        element.find('.username').html('<a href="#!/pilot/' + res.username + '">' + res.username + '</a>');
        var rDelta = Math.round(res.newRating - res.oldRating);
        element.find('.rating').html( ((rDelta >= 0)? " + " : "") +  rDelta + " ( " + Math.round(res.newRating) + " ) " );
      }

        element.find('.position').html(posPerScore[res.score] + '.');
        element.find('.kills').html(res.kills);
        element.find('.deaths').html(res.deaths);
        element.find('.suicides').html(res.suicides);
        element.find('.score').html(res.score);


      scores.append(element);
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

  window.aw.ui.round = round;
})(window);