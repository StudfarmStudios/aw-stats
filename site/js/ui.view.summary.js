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
  var servers;

  var playersOnline = 0;
  var playersWaiting = 0;

  function roundNumber(num, dec) {
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
  }

  function constructPilotList() {

    pilotList.empty();
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
          pilotElement.find('.score').html('(' + (pilot.score ? pilot.score : 0) + ')');
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
    scoreList.empty();
    window.aw.stats.pilots(1, 10, 'score', function (data) {
      $.each(data.pilots, function (indx, pilot) {
        var pilotElement = $(pilotHtml);
        pilotElement.find('a').html(pilot.username);
        pilotElement.find('a').attr("href", "#!/pilot/" + pilot.username);
        pilotElement.find('.score').html('(' + (pilot.score ? pilot.score : 0) + ')');
        scoreList.append(pilotElement);
      });
    });
    ratingList.empty();
    window.aw.stats.pilots(1, 10, 'rating', function (data) {
      $.each(data.pilots, function (indx, pilot) {
        var pilotElement = $(pilotHtml);
        pilotElement.find('a').html(pilot.username);
        pilotElement.find('a').attr("href", "#!/pilot/" + pilot.username);
        pilotElement.find('.score').html('(' + roundNumber((pilot.rating ? pilot.rating : 1500), 2) + ')');
        ratingList.append(pilotElement);
      });
    });
  }

  function constructServerList() {

    function createList() {

      playersOnline = 0;
      playersWaiting = 0;

      $.each(servers, function (indx, server) {

        var serverElement = serverElements[server.id];
        if (serverElement == undefined) {
          serverElement = $(serverHtml);
          serverElements[server.id] = serverElement;
          serverList.append(serverElement);
          serverElement.find('.server-name').html(server.name);
          serverElement.find('.server-limit').html(server.maxclients);
        }

        serverElement.find('.join').unbind("click").click(function (e) {
          aw.ui.awl.join(server);
          e.preventDefault();
        });
        serverElement.find('.join').popover({
          title: "Join",
          content: "Join the server and play online."
        });


        playersOnline += server.currentclients;
        playersWaiting += server.waiting;

        serverElement.find('.server-current').html(server.currentclients);
        serverElement.find('.server-waiting').html(server.waiting);

      });
      content.find('.pilot-count').html("<h2>Players online</h2><h3>" + (playersOnline + playersWaiting) + "</h3>");
    }

    if (servers == null) {
       window.aw.stats.api('/server/list', {}, function (serv) {
          servers = serv;
          createList();
        });
    } else {
      createList();
    }


  }

  function updateServer (server) {
    for (var i = 0; i < servers.length; i++) {
      var serv = servers[i];

      if (serv.id == server.id) {
        var key;
        for (key in server) {
          serv[key] = server[key];
        }
        constructServerList();
        return;
      }
    }

    addServer(server);
    constructServerList();
  }

  function addServer (server) {
    servers.push(server);
    constructServerList();
  }

  function removeServer (id) {
    if (serverElements[id]) {
      serverElements[id].remove();
    }
    for (var i = 0; i < servers.length; i++) {
      var serv = servers[i];

      if (serv.id == id) {
        servers.splice(i, 1);
        constructServerList();
        return;
      }
    }
  }

  function startListeningSocketEvents() {

    aw.socket.on('server_update', function (server) {

      updateServer(server);
    });

    aw.socket.on('server_add', function (server) {
      aw.ui.toaster({title:"New server created", content: "New server (" + server.name + ") created"});
      addServer(server);
    });

    aw.socket.on('server_remove', function (server) {
      aw.ui.toaster({title:"Server removed", content: "Server (" + server.name + ") removed"});
      removeServer(server.id);
    })
  }


  var summary = function () {
    if (content == null) {
      content = $(contentHtml);
      pilotList = content.find('.pilot-list');
      showMorePilots = content.find('.more-pilots');
      scoreList = content.find('.score-list');
      serverList = content.find('.server-table');
      ratingList = content.find('.rating-list');

      startListeningSocketEvents();
    }

    content.find('.play-now a').popover({
      title: "Quick Play",
      content: "Don't know which server to select? Quick Play will do it for you.",
      placement: 'left'
    });

    content.find('.auto-play a').popover({
      title: "Wait And Play",
      content: "Wait And Play lets Assault Wing automatically start when other pilots join a server.",
      placement: 'left'
    });

    $('.container .content').html(content);
    $('.nav li').removeClass('active');
    $('.nav .rankings').addClass('active');

    content.find('.play-now a').unbind("click").click(function (e) {
      var server = servers[0];
      for (var i = 0; i < servers.length; i++) {
        server = servers[i];

        if (server.currentclients < server.maxclients) {
          break;
        }
        
      }

      if (server != null) {
        aw.ui.awl.join(server);
      }

      e.preventDefault();
    });


    constructPilotList();
    constructRankings();
    constructServerList();

    return {
      cleanup: function () {
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

  if (window.aw.ui.view == undefined) {
    window.aw.ui.view = {};
  }

  window.aw.ui.view.summary = summary;
})(window);