aw.awl.init();
$(function () {
  function processHash() {
    var hash = window.location.hash || "#!/summary";
    if (hash == "#" || hash == "#!" || hash == "#!/") {
      hash = "#!/summary";
    }
    var parts = hash.split('/');
    var view = parts[1];

    if (window.currentView && window.currentView.cleanup) {
      window.currentView.cleanup();
    }

    if (window.aw.ui.view[view] && typeof window.aw.ui.view[view] === 'function') {
      window.currentView = window.aw.ui.view[view](hash);
    } else {
      window.currentView = window.aw.ui.view.notfound(hash);
    }
  }

  $(window).hashchange(processHash);
  processHash();

  aw.ui.login.init();
  aw.ui.awl.init();

});