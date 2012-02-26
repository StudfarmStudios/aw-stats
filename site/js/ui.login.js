(function (window) {
  var loginModalHtml = document.getElementById('login-modal-template').innerHTML;
  var loginModal;
  var loggedIn = true;

  if (window.loginToken == undefined) {
    loggedIn = false;
  }

  var login = function () {

  };

  login.dialog = function () {
    if (loginModal == null) {
      loginModal = $(loginModalHtml);
      loginModal.find('.close-login-modal').click(function () {
        loginModal.modal("hide");
      });
    }

    loginModal.modal("show");
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