(function (window) {
  var stats = {url: parent.location.protocol + "//" + window.location.hostname + ":3001"};

  stats.api = function (path, data, callback) {
    $.getJSON(this.url + path + "?callback=?", data, callback);
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