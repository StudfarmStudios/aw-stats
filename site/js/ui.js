(function (window) {

  var hasClickOnceChromePlugin = function () {
    if (window.clientInformation && window.clientInformation.plugins) {
      // check to see if a ClickOnce extension is installed.
      for (var i = 0; i < clientInformation.plugins.length; i++)
        if (clientInformation.plugins[i].name == 'ClickOnce plugin for Chrome') return true;
    }
    return false;
  };

  var hasNativeClickOnceSupport = function (callback) {
     window.aw.stats.info(function (data) {
       callback(data.nativeClickOnce != undefined);
     });
  };

  var startAssaultWing = function (callback) {
    var url = 'http://www.assaultwing.com/install/AssaultWing.application';
    if (hasClickOnceChromePlugin()) {
      var embed = document.createElement('embed');
      embed.setAttribute('type', 'application/x-ms-application');
      embed.setAttribute('width', 0);
      embed.setAttribute('height', 0);
      // Have to add the embed to the document for it
      // to actually instantiate.
      document.body.appendChild(embed);
      embed.launchClickOnce(url);
      // Don't remove the embed right away b/c it can
      // cancel the download of the .application.
      callback(true);
    } else {
      hasNativeClickOnceSupport(function (hasSupport) {
        if (hasSupport) {
          var iframe = document.createElement('iframe');
          iframe.setAttribute('width', 0);
          iframe.setAttribute('height', 0);
          iframe.setAttribute('src', url);
          document.body.appendChild(iframe);
        } else {
          callback(false);
        }
      });
    }
  };

  $(function () {
    $('.clickonce').click(function () {
      startAssaultWing(function (started) {
        if (!started) {
          alert("HAS NO WAY TO START");
        }
      });
      return false;
    })
  });
})(window);