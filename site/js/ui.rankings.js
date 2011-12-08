(function (window) {

  var content,
      pilotList,
      showMorePilots,
      scoreList;

  var contentHtml = ''
        + '<div class="page-header">'
        + '  <h1>Rankings <small></small></h1>'
        + '</div>'
        + '<div class="row">'
        + '  <div class="span10">'
        + '    <h2>Scores (top 10)</h2>'
        + '    <ol class="score-list"></ol>'
        + '  </div>'
        + '  <div class="span4">'
        + '    <h3>Pilots</h3>'
        + '    <ul class="pilot-list"></ul>'
        + '    <a class="more-pilots btn" href="#">Show more</a>'
        + '  </div>'
        + '</div>';

  var pilotHtml = ''
        + '<li class="pilot"><a href="#"></a> <small class="score"></small></li>';

  function constructPilotList() {
    var page = 0;
    var limit = 15;
    function loadMorePilots() {
      page++;
      window.aw.stats.pilots(page, limit, 'username', function (data) {
        if (data.length < limit) {
          showMorePilots.hide();
          setTimeout(function () {
            showMorePilots.show();
          }, 60 * 1000 * 5);
        } else {
          showMorePilots.show();
        }

        $.each(data, function (indx, pilot) {
          var pilotElement = $(pilotHtml);
          pilotElement.find('a').html(pilot.username);
          pilotElement.find('a').attr("href", "#!/pilot/" + pilot.username);
          pilotElement.find('.score').html('('+(pilot.score && pilot.score.total ? pilot.score.total : 0)+')');
          pilotList.append(pilotElement);
        });
      });
    }

    loadMorePilots();

    showMorePilots.click(function () {
      loadMorePilots();
      return false;
    });
  }

  function constructRankings() {
    window.aw.stats.pilots(1, 10, 'score', function (pilots) {
      $.each(pilots, function (indx, pilot) {
        var pilotElement = $(pilotHtml);
        pilotElement.find('a').html(pilot.username);
        pilotElement.find('a').attr("href", "#!/pilot/" + pilot.username);
        pilotElement.find('.score').html('('+(pilot.score && pilot.score.total ? pilot.score.total : 0)+')');
        scoreList.append(pilotElement);
      });
    });
  }

  var rankings = function () {
    content = $(contentHtml);
    pilotList = content.find('.pilot-list');
    showMorePilots = content.find('.more-pilots');
    scoreList = content.find('.score-list');
    $('.container .content').html(content);
    $('.nav li').removeClass('active');
    $('.nav .rankings').addClass('active');

    constructPilotList();
    constructRankings();
  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.rankings = rankings;
})(window);