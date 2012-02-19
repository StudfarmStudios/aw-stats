(function (window) {

  var content,
      pilotList,
      showMorePilots,
      scoreList,
      ratingList,
      serverList;

  var contentHtml = ''
        + '<div class="page-header">'
        + '  <h1>Rankings <small></small></h1>'
        + '</div>'
        + '<div class="row">'
        + '  <div class="span6">'
        + '    <h2>Servers</h2>'
        + '    <table class="table">'
        + '      <thead><th>Name</th><th>Current</th><th>Limit</th></thead>'
        + '      <tbody class="server-table"></tbody>'
        + '    </table>'
        + '    <h2>Scores (top 10)</h2>'
        + '    <ol class="score-list"></ol>'
        + '    <h2>Ratings (top 10)</h2>'
        + '    <ol class="rating-list"></ol>'
        + '  </div>'
        + '  <div class="span4">'
        + '    <h3>Pilots</h3>'
        + '    <ul class="pilot-list"></ul>'
        + '    <a class="more-pilots btn" href="#">Show more</a>'
        + '  </div>'
        + '</div>';

  var pilotHtml = ''
        + '<li class="pilot"><a href="#"></a> <small class="score"></small></li>';

  var serverHtml = ''
        + '<tr>'
        + '  <td class="server-name"></td>'
        + '  <td class="server-current"></td>'
        + '  <td class="server-limit"></td>'
        + '</tr>';

  function roundNumber(num, dec) {
	  var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	  return result;
  }

  function constructPilotList() {
    var page = 0;
    var limit = 15;
    function loadMorePilots() {
      page++;
      window.aw.stats.pilots(page, limit, 'username', function (data) {
        if (data.pilots.length < limit) {
          showMorePilots.hide();
          setTimeout(function () {
            showMorePilots.show();
          }, 60 * 1000 * 5);
        } else {
          showMorePilots.show();
        }

        $.each(data.pilots, function (indx, pilot) {
          var pilotElement = $(pilotHtml);
          pilotElement.find('a').html(pilot.username);
          pilotElement.find('a').attr("href", "#!/pilot/" + pilot.username);
          pilotElement.find('.score').html('('+(pilot.score ? pilot.score : 0)+')');
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
    window.aw.stats.pilots(1, 10, 'score', function (data) {
      $.each(data.pilots, function (indx, pilot) {
        var pilotElement = $(pilotHtml);
        pilotElement.find('a').html(pilot.username);
        pilotElement.find('a').attr("href", "#!/pilot/" + pilot.username);
        pilotElement.find('.score').html('('+(pilot.score ? pilot.score : 0)+')');
        scoreList.append(pilotElement);
      });
    });
    window.aw.stats.pilots(1, 10, 'rating', function (data) {
      $.each(data.pilots, function (indx, pilot) {
        var pilotElement = $(pilotHtml);
        pilotElement.find('a').html(pilot.username);
        pilotElement.find('a').attr("href", "#!/pilot/" + pilot.username);
        pilotElement.find('.score').html('('+roundNumber((pilot.rating ? pilot.rating : 1500),2)+')');
        ratingList.append(pilotElement);
      });
    });
  }

  function constructServerList() {
    window.aw.stats.api('/server/list', {}, function (servers) {
      $.each(servers, function (indx, server) {
        var serverElement = $(serverHtml);
        serverElement.find('.server-name').html(server.name);
        serverElement.find('.server-current').html(server.currentclients);
        serverElement.find('.server-limit').html(server.maxclients);
        serverList.append(serverElement);
      })
    });
  }

  var rankings = function () {
    content = $(contentHtml);
    pilotList = content.find('.pilot-list');
    showMorePilots = content.find('.more-pilots');
    scoreList = content.find('.score-list');
    serverList = content.find('.server-table');
    ratingList = content.find('.rating-list');
    $('.container .content').html(content);
    $('.nav li').removeClass('active');
    $('.nav .rankings').addClass('active');

    constructPilotList();
    constructRankings();
    constructServerList();
  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.rankings = rankings;
})(window);