(function (window) {
  var awl = {url: parent.location.protocol + "//" + window.location.hostname + ":3001"};

  awl.api = function (path, data, callback) {
    $.getJSON(this.url + path + "?callback=?", data, callback);
  };


  awl._loadPlugin = function () {
    this.plugin = $('<object id="awl" type="application/x-assaultwinglauncher" width="1" height="1"></object>');
    $('head').append(this.plugin);
  };

  awl.isPluginLoaded = function () {
    return (document.getElementById('awl') != null);
  };

  awl.init = function () {
    if (!this.isPluginLoaded()) {
      this._loadPlugin();
    } else {
      this.plugin = $('#awl');
    }
  };

  awl.isPluginInstalled = function () {
    if (!this.isPluginLoaded()) {
      throw new Error("Plugin is not loaded");
    }

    return this.plugin[0].start != undefined;
  };

  awl.start = function (params) {
    if (this.isPluginLoaded && this.isPluginInstalled()) {
      return false;
    }

    var kvps = [];
    var key;
    for (key in params) {
      kvps.push(key + "=" + params[key]);
    }


    this.plugin[0].start(kvps.join('&'));
  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  window.aw.awl = awl;

})(window);