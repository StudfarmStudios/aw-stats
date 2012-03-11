(function (window) {

  var content,
      pilotList,
      showMorePilots,
      scoreList,
      ratingList,
      serverList;

  var serverUpdateTimeout;

  var contentHtml = document.getElementById('summary-content-template').innerHTML;
  var pilotHtml = document.getElementById('summary-pilot-template').innerHTML;
  var serverHtml = document.getElementById('summary-server-template').innerHTML;

  var serverElements = {};

  function roundNumber(num, dec) {
	  var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	  return result;
  }

  function constructPilotList() {
    var page = 0;
    var limit = 15;
    function loadMorePilots() {
      page++;
      window.aw.stats.pilots(page, limit, 'created', function (data) {
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

      if (servers.length > 0) {
        var server;
        for (var i = 0; i < servers.length; i++) {
          if (servers[i].currentclients < servers[i].maxclients) {
            server = servers[i];
            break;
          }
        }
        content.find('.play-now a').unbind().click(function (e) {
          aw.ui.awl.join(server);
          e.preventDefault();
        });

        content.find('.auto-play a').unbind().click(function (e) {
          aw.ui.awl.autoPlay();
          e.preventDefault();
        });

      }

      var serverIds = [];
      $.each(servers, function (indx, server) {

        serverIds.push(server.id);

        var serverElement = serverElements[server.id];
        if (serverElement == undefined) {
          serverElement = $(serverHtml);
          serverElements[server.id] = serverElement;
          serverList.append(serverElement);
          serverElement.find('.server-name').html(server.name);
          serverElement.find('.server-limit').html(server.maxclients);
          serverElement.find('.join').click(function (e) {
            aw.ui.awl.join(server);
            e.preventDefault();
          });
        }

        serverElement.find('.server-current').html(server.currentclients);
      });

      var currentIds = Object.keys(serverElements);
      $.each(currentIds, function (indx, id) {
        if ($.inArray(id, serverIds) == -1) {
          serverElements[id].remove();
        }
      });
          
    });




    serverUpdateTimeout = setTimeout(function () {
      constructServerList();
    }, 1000 * 15);

  }

  var summary = function () {
    serverElements = {};
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

    
    return {
      cleanup: function () {
        serverElements = {};
        clearTimeout(serverUpdateTimeout);
      }
    };
    
  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.summary = summary;
})(window);