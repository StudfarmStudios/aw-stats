(function (window) {
  var loginModalHtml = document.getElementById('login-modal-template').innerHTML;
  var loggedIn = true;

  if (window.loginToken == undefined) {
    loggedIn = false;
  }

  var login = function () {

  };

  login.dialog = function () {
    var loginModal = $(loginModalHtml);
    loginModal.modal();
  };

  if (window.aw == null) {
    window.aw = {};
  }

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.login = login;

})(window);