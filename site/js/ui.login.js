(function (window) {
  var loginModalHtml = document.getElementById('login-modal-template').innerHTML;
  var loginModal;
  var form;
  var loginButton;

  var login = function () {

  };

  login.updateView = function () {
     window.loginToken = window.loginToken || (window.localStorage ? window.localStorage['loginToken'] : null);
    if (window.loginToken) {
      $('.show-when-logged-out').hide();
      $('.show-when-logged-in').show();
      aw.stats.getUser(function (data) {
        $('.current-user-username').html(data.username);
        $('.current-user-profile').attr('href', '#!/pilot/' + data.username);
      });

    } else {
      $('.show-when-logged-out').show();
      $('.show-when-logged-in').hide();

      if (loginModal) {
        loginModal.find('.login-input').val('');
      }

    }
  };

  login.init = function () {
    $('.login').click(function (e) {
      aw.ui.login.dialog(function () {

      });
      e.preventDefault();
    });

    $('.logout').click(function (e) {
      e.preventDefault();
      aw.stats.logout();
    });

    login.updateView();
  };

  login.dialog = function (cb) {

    var callback = function (user) {
      if (cb) {
        cb(user);
        cb = null;
      }
    };

    if (window.loginToken == undefined) {
      if (loginModal == null) {
        loginModal = $(loginModalHtml);
        loginModal.find('.close-login-modal').click(function (e) {
          loginModal.modal("hide");
          callback({error:"canceled login"});
        });

        form = loginModal.find('form');
        form.submit(function (e) {
          e.preventDefault();
          var values = $(this).serializeArray();
          var valuesObject = {};
          for (var i = 0; i < values.length; i++) {
            var value = values[i];
            valuesObject[value.name] = value.value;
          }

          aw.stats.login(valuesObject.username, valuesObject.password, function (data) {
            if (data.error) {
              loginModal.find('.login-error').html(data.error);
              loginModal.find('.login-error').show();
              return;
            }
            loginModal.modal("hide");
            callback(data);
          });
        });

        loginButton = loginModal.find('.login-button');

        loginButton.click(function (e) {
          e.preventDefault();
          form.submit();
        });

        loginModal.find('.login-input').keypress(function (event) {
          if (event.which == 13) {
            event.preventDefault();
            form.submit();
          }
        });

      }

      loginModal.modal("show");
    } else {
      aw.stats.getUser(function (user) {
        callback(user)
      });
    }
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