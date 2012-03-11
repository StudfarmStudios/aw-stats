(function (window) {
  var stats = {url: parent.location.protocol + "//" + window.location.hostname + ":3001"};

  stats.api = function (path, data, callback) {
    $.getJSON(this.url + path + "?callback=?", data, callback);
  };

  stats.info = function (callback) {
    var key = 'info';
    var cachedData = aw.cache.get(key);
    if (cachedData) {
      return callback(cachedData);
    }
    this.api('/info', {}, function (data) {
          if (data.error == undefined) {
            aw.cache.set(key, data, 6000);
          }
          callback(data);
        });
  };

  stats.pilots = function (page, limit, sort, callback) {
    var key = 'pilots_' + page + '_' + limit + '_' + sort;
    var cachedData = aw.cache.get(key);
    if (cachedData) {
      return callback(cachedData);
    }
    this.api('/pilot/list', {page: page, limit:limit, sortBy:sort}, function (data) {
          if (data.error == undefined) {
            aw.cache.set(key, data, 60);
          }

          callback(data);
        });
  };

  stats.pilotsSearch = function (page, limit, sort, search, callback) {
    var key = 'pilots_' + page + '_' + limit + '_' + sort + '_' + search;
    var cachedData = aw.cache.get(key);
    if (cachedData) {
      return callback(cachedData);
    }
    this.api('/pilot/search', {page: page, limit:limit, sortBy:sort, search: search}, function (data) {
          if (data.error == undefined) {
            aw.cache.set(key, data, 60);
          }

          callback(data);
        });
  };

  stats.rounds = function (page, limit, sort, callback) {
    var key = 'round_' + page + '_' + limit + '_' + sort;
    var cachedData = aw.cache.get(key);
    if (cachedData) {
      return callback(cachedData);
    }
    this.api('/round/list', {page: page, limit:limit, sortBy:sort}, function (data) {
          if (data.error == undefined) {
            aw.cache.set(key, data, 60);
          }

          callback(data);
        });
  };

  stats.round = function (id, callback) {
    var key = 'round_' + id;
    var cachedData = aw.cache.get(key);
    if (cachedData) {
      return callback(cachedData);
    }
    this.api('/round/' + id, {}, function (data) {
          if (data.error == undefined) {
            aw.cache.set(key, data, 60);
          }

          callback(data);
        });
  };

  stats.roundsForPilot = function (page, limit, sort, id, callback) {
    var key = 'round_' + page + '_' + limit + '_' + sort + '_' + id;
    var cachedData = aw.cache.get(key);
    if (cachedData) {
      return callback(cachedData);
    }
    this.api('/round/list', {page: page, limit:limit, sortBy:sort, pilotId: id}, function (data) {
          if (data.error == undefined) {
            aw.cache.set(key, data, 60);
          }

          callback(data);
        });
  };

  stats.pilotById = function (id, callback) {
    var key = 'pilot_';
    var cachedData = aw.cache.get(key + id);
    if (cachedData) {
      return callback(cachedData);
    }
    this.api('/pilot/id/' + id, {}, function (data) {
          if (data.error == undefined) {
            aw.cache.set(key + data._id, data, 60);
            aw.cache.set(key + data.username, data, 60);
          }
          callback(data);
        });
  };

  stats.ratings = function (id, callback) {
    var key = 'pilot_ratings_' + id;
    var cachedData = aw.cache.get(key);
    if (cachedData) {
      return callback(cachedData);
    }
    this.api('/pilot/id/' + id + '/rankings', {}, function (data) {
          if (data.error == undefined) {
            aw.cache.set(key, data, 60);
          }
          callback(data);
        });
  };

  stats.pilotByUsername = function (username, callback) {
    var key = 'pilot_';
    var cachedData = aw.cache.get(key + username);
    if (cachedData) {
      return callback(cachedData);
    }
    this.api('/pilot/' + username, {}, function (data) {
          if (data.error == undefined) {
            aw.cache.set(key + data._id, data, 60);
            aw.cache.set(key + data.username, data, 60);
          }
          callback(data);
        });
  };

  stats.logout = function () {
    window.loginToken = undefined;
    if (window.localStorage) {
      localStorage.removeItem('loginToken');
    }
    aw.ui.login.updateView();
  };

  stats.getUser = function (callback) {
    window.loginToken = window.loginToken || (window.localStorage ? window.localStorage['loginToken'] : null);
    if (window.loginToken == undefined) {
      callback({error: "not logged in"});
      return;
    }
    var key = 'current_user_' + window.loginToken;
    var cachedData = aw.cache.get(key);
    if (cachedData) {
      return callback(cachedData);
    }

    this.api('/pilot/token/' + window.loginToken, {}, function (data) {
          if (data.error == undefined) {
            aw.cache.set(key, data, 60);
          }
          callback(data);
        });
  };

  stats.login = function (username, password, callback) {

    var success = function(data) {
      if (data.token) {
        window.loginToken = data.token;
        if (window.localStorage) {
          localStorage['loginToken'] = data.token;
        }
      }

      if (data.error == undefined) {
        aw.cache.set('current_user_' + window.loginToken, data, 60);
      }

      aw.ui.login.updateView();
      callback(data);
    };

    if ($.browser.msie) {
      $.ajax({
        url : 'login',
        type: 'POST',
        data: {
          username: username,
          password: password
        },
        dataType : 'json',
        success : success
      });
    } else {
      $.ajax({
        url : 'login',
        dataType : 'json',
        'beforeSend' : function(xhr) {
          var bytes = Crypto.charenc.Binary.stringToBytes(username + ":" + password);
          var base64 = Crypto.util.bytesToBase64(bytes);

          xhr.setRequestHeader("Authorization", "Basic " + base64);
        },
        error : function(xhr, ajaxOptions, thrownError) {

        },
        success : success
      });
    }


  };

  stats.register = function (username, password1, password2, email, callback) {
    this.api('/pilot/create', {username: username, password1: password1, password2: password2, email: email}, function (data) {
          if (data.error == undefined) {
            aw.cache.set('pilot_' + data._id, data, 60);
            aw.cache.set('pilot_' + data.username, data, 60);
          }
          callback(data);
        });
  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  window.aw.stats = stats;

})(window);