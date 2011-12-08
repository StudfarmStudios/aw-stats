(function (window) {
  var cache = {data: {}};
  
  cache.set = function (key, data, ttl) {
    var self = this;
    cache.data[key] = data;
    if (ttl && ttl > 0) {
      setTimeout(function () {
        delete self.del(key);
      }, ttl * 1000);
    }
  };

  cache.get = function (key) {
    return cache.data[key];
  };

  cache.push = function (key, data) {
    if (cache.data[key] && Array.isArray(cache.data[key])) {
      cache.data[key].push(data);
    } else if (cache.data[key] == null) {
      cache.data[key] = [data];
    } else {
      return false;
    }
    return true;
  };

  cache.inc = function (key, value) {
    if (cache.data[key] && typeof cache.data[key] === 'number') {
      cache.data[key] += value;
    } else if (cache.data[key] == null) {
      cache.data[key] = value;
    } else {
      return false;
    }
    return true;
  };

  cache.del = function (key) {
    delete cache.data[key];
  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  window.aw.cache = cache;
})(window);